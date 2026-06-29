import {
  PutCommand,
  UpdateCommand,
  GetCommand,
  QueryCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  AdminCreateUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  MessageActionType,
} from '@aws-sdk/client-cognito-identity-provider';
import { dynamo } from '../shared/dynamo';
import { cognitoClient } from '../shared/cognito';
import { requireAuth, requireRole } from '../shared/auth';
import { ok, err } from '../shared/response';

const USERS_TABLE = process.env.USERS_TABLE!;
const CLASS_MEMBERS_TABLE = process.env.CLASS_MEMBERS_TABLE!;
const TEACHER_ASSIGNMENTS_TABLE = process.env.TEACHER_ASSIGNMENTS_TABLE!;
const STUDENT_SUBJECTS_TABLE = process.env.STUDENT_SUBJECTS_TABLE!;
const USER_POOL_ID = process.env.USER_POOL_ID!;

/**
 * Routes:
 *   POST   /users           → createUser
 *   PUT    /users/{userId}  → updateUser
 *   DELETE /users/{userId}  → deactivateUser
 *   POST   /users/fcm-token → saveFcmToken
 *   GET    /users/me        → getMe
 */
export const handler = async (event: any) => {
  try {
    const method = event.httpMethod;
    const path = event.resource;

    // POST /users/fcm-token — any authenticated user
    if (method === 'POST' && path === '/users/fcm-token') {
      return handleSaveFcmToken(event);
    }

    // GET /users/me — any authenticated user
    if (method === 'GET' && path === '/users/me') {
      return handleGetMe(event);
    }

    // All other routes — admin only
    const auth = await requireAuth(event);
    requireRole(auth.role, 'admin');

    if (method === 'POST' && path === '/users') {
      return handleCreateUser(event, auth.userId);
    }
    if (method === 'PUT') {
      return handleUpdateUser(event, auth.userId);
    }
    if (method === 'DELETE') {
      return handleDeactivateUser(event);
    }

    return err(404, 'Route not found');
  } catch (e: any) {
    if (e.statusCode) return err(e.statusCode, e.message);
    console.error('user-management error:', e);
    return err(500, 'Internal server error');
  }
};

// ─── POST /users/fcm-token ───────────────────────────────────

async function handleSaveFcmToken(event: any) {
  const auth = await requireAuth(event);
  const body = JSON.parse(event.body || '{}');
  const { fcmToken } = body;

  if (!fcmToken || typeof fcmToken !== 'string') {
    return err(400, 'fcmToken is required');
  }

  await dynamo.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId: auth.userId },
      UpdateExpression: 'SET fcmToken = :token',
      ExpressionAttributeValues: { ':token': fcmToken },
    })
  );

  return ok({ success: true });
}

// ─── GET /users/me ───────────────────────────────────────────

async function handleGetMe(event: any) {
  const auth = await requireAuth(event);

  const result = await dynamo.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: auth.userId },
    })
  );

  if (!result.Item) {
    return err(404, 'User not found');
  }

  return ok(result.Item);
}

// ─── POST /users → Create Teacher or Student ────────────────

async function handleCreateUser(event: any, adminUserId: string) {
  const body = JSON.parse(event.body || '{}');
  const { role, name, email, phone } = body;

  if (!role || !['teacher', 'student'].includes(role)) {
    return err(400, 'role must be "teacher" or "student"');
  }
  if (!name || !email) {
    return err(400, 'name and email are required');
  }

  // Create Cognito user with temporary password
  const tempPassword = `Tmg${Date.now().toString(36)}!`;

  const userAttributes = [
    { Name: 'email', Value: email },
    { Name: 'email_verified', Value: 'true' },
    { Name: 'custom:role', Value: role },
  ];

  if (phone) {
    userAttributes.push(
      { Name: 'phone_number', Value: phone },
      { Name: 'phone_number_verified', Value: 'true' }
    );
  }

  const cognitoResult = await cognitoClient.send(
    new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      TemporaryPassword: tempPassword,
      UserAttributes: userAttributes,
      MessageAction: MessageActionType.SUPPRESS, // Don't send invite email
    })
  );

  const userId = cognitoResult.User?.Attributes?.find(
    (a) => a.Name === 'sub'
  )?.Value;

  if (!userId) {
    return err(500, 'Failed to create Cognito user — no sub returned');
  }

  const now = new Date().toISOString();

  if (role === 'teacher') {
    return createTeacher(userId, name, email, phone, body.assignments, adminUserId, now, tempPassword);
  } else {
    return createStudent(userId, name, email, phone, body, adminUserId, now, tempPassword);
  }
}

async function createTeacher(
  userId: string,
  name: string,
  email: string,
  phone: string | undefined,
  assignments: Array<{ classId: string; subject: string }> | undefined,
  adminUserId: string,
  now: string,
  tempPassword: string
) {
  // Write TMG_Users
  await dynamo.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        userId,
        name,
        email,
        phone: phone || null,
        role: 'teacher',
        active: true,
        createdAt: now,
      },
    })
  );

  // Write TMG_TeacherAssignments (batch)
  if (assignments && assignments.length > 0) {
    const putRequests = assignments.map((a) => ({
      PutRequest: {
        Item: {
          teacherId: userId,
          'classId#subject': `${a.classId}#${a.subject}`,
          classId: a.classId,
          subject: a.subject,
          assignedAt: now,
          assignedBy: adminUserId,
        },
      },
    }));

    // DynamoDB BatchWrite limit: 25 items
    for (let i = 0; i < putRequests.length; i += 25) {
      const batch = putRequests.slice(i, i + 25);
      await dynamo.send(
        new BatchWriteCommand({
          RequestItems: { [TEACHER_ASSIGNMENTS_TABLE]: batch },
        })
      );
    }
  }

  return ok({
    userId,
    tempPassword,
    message: `Teacher "${name}" created with ${assignments?.length || 0} assignments`,
  });
}

async function createStudent(
  userId: string,
  name: string,
  email: string,
  phone: string | undefined,
  body: any,
  adminUserId: string,
  now: string,
  tempPassword: string
) {
  const { rollNo, classId, parentPhone, subjects } = body;

  if (!classId || !rollNo) {
    return err(400, 'classId and rollNo are required for students');
  }

  // Write TMG_Users
  await dynamo.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        userId,
        name,
        email,
        phone: phone || null,
        role: 'student',
        classId,
        rollNo,
        parentPhone: parentPhone || null,
        active: true,
        createdAt: now,
      },
    })
  );

  // Write TMG_ClassMembers
  await dynamo.send(
    new PutCommand({
      TableName: CLASS_MEMBERS_TABLE,
      Item: {
        classId,
        userId,
        role: 'student',
        joinedAt: now,
      },
    })
  );

  // Write TMG_StudentSubjects (batch)
  if (subjects && subjects.length > 0) {
    const putRequests = subjects.map((subject: string) => ({
      PutRequest: {
        Item: {
          studentId: userId,
          'classId#subject': `${classId}#${subject}`,
          classId,
          subject,
          enrolledAt: now,
          enrolledBy: adminUserId,
        },
      },
    }));

    for (let i = 0; i < putRequests.length; i += 25) {
      const batch = putRequests.slice(i, i + 25);
      await dynamo.send(
        new BatchWriteCommand({
          RequestItems: { [STUDENT_SUBJECTS_TABLE]: batch },
        })
      );
    }
  }

  return ok({
    userId,
    tempPassword,
    message: `Student "${name}" created with ${subjects?.length || 0} subjects`,
  });
}

// ─── PUT /users/{userId} → Update user ──────────────────────

async function handleUpdateUser(event: any, adminUserId: string) {
  const userId = event.pathParameters?.userId;
  if (!userId) return err(400, 'userId path parameter is required');

  const body = JSON.parse(event.body || '{}');
  const updates: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, any> = {};

  if (body.name) {
    updates.push('#n = :name');
    names['#n'] = 'name';
    values[':name'] = body.name;
  }
  if (body.phone !== undefined) {
    updates.push('phone = :phone');
    values[':phone'] = body.phone || null;
  }
  if (body.rollNo !== undefined) {
    updates.push('rollNo = :rollNo');
    values[':rollNo'] = body.rollNo;
  }
  if (body.parentPhone !== undefined) {
    updates.push('parentPhone = :parentPhone');
    values[':parentPhone'] = body.parentPhone || null;
  }
  if (typeof body.active === 'boolean') {
    updates.push('active = :active');
    values[':active'] = body.active;

    // Also enable/disable in Cognito
    const existingUser = await dynamo.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
        ProjectionExpression: 'email',
      })
    );
    const email = existingUser.Item?.email;
    if (email) {
      if (body.active) {
        await cognitoClient.send(
          new AdminEnableUserCommand({ UserPoolId: USER_POOL_ID, Username: email })
        );
      } else {
        await cognitoClient.send(
          new AdminDisableUserCommand({ UserPoolId: USER_POOL_ID, Username: email })
        );
      }
    }
  }

  if (updates.length === 0) {
    return err(400, 'No fields to update');
  }

  await dynamo.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeNames: Object.keys(names).length > 0 ? names : undefined,
      ExpressionAttributeValues: values,
    })
  );

  return ok({ userId, updated: Object.keys(values) });
}

// ─── DELETE /users/{userId} → Deactivate ────────────────────

async function handleDeactivateUser(event: any) {
  const userId = event.pathParameters?.userId;
  if (!userId) return err(400, 'userId path parameter is required');

  // Get user email for Cognito disable
  const userResult = await dynamo.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
      ProjectionExpression: 'email',
    })
  );

  if (!userResult.Item) {
    return err(404, 'User not found');
  }

  // Disable in Cognito
  await cognitoClient.send(
    new AdminDisableUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: userResult.Item.email,
    })
  );

  // Mark inactive in DynamoDB
  await dynamo.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET active = :inactive',
      ExpressionAttributeValues: { ':inactive': false },
    })
  );

  return ok({ userId, deactivated: true });
}
