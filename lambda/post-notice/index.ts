import { PutCommand, QueryCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { PublishCommand, CreatePlatformEndpointCommand } from '@aws-sdk/client-sns';
import { v4 as uuid } from 'uuid';
import { dynamo } from '../shared/dynamo';
import { snsClient } from '../shared/sns';
import { requireAuth, requireRole, requireTeacherAssignment } from '../shared/auth';
import { ok, err } from '../shared/response';

const NOTICES_TABLE = process.env.NOTICES_TABLE!;
const USERS_TABLE = process.env.USERS_TABLE!;
const STUDENT_SUBJECTS_TABLE = process.env.STUDENT_SUBJECTS_TABLE!;
const SNS_FCM_ARN = process.env.SNS_FCM_ARN!;

/**
 * POST /notices
 * Body: { scope, classId?, subject?, title, body }
 * Admin → scope: 'global'. Teacher → scope: 'subject' (verified assignment).
 */
export const handler = async (event: any) => {
  try {
    const auth = await requireAuth(event);
    const payload = JSON.parse(event.body || '{}');
    const { scope, classId, subject, title, body: noticeBody } = payload;

    // Validate scope
    if (!scope || !['global', 'subject'].includes(scope)) {
      return err(400, 'scope must be "global" or "subject"');
    }
    if (!title || typeof title !== 'string') {
      return err(400, 'title is required');
    }
    if (!noticeBody || typeof noticeBody !== 'string') {
      return err(400, 'body is required');
    }
    if (noticeBody.length > 5000) {
      return err(400, 'body cannot exceed 5000 characters');
    }

    // Role-based scope enforcement
    if (scope === 'global') {
      requireRole(auth.role, 'admin');
    } else {
      // scope === 'subject'
      requireRole(auth.role, 'teacher');
      if (!classId || !subject) {
        return err(400, 'classId and subject are required for subject notices');
      }
      await requireTeacherAssignment(dynamo, auth.userId, classId, subject);
    }

    // Get poster's name for denormalized display
    const userResult = await dynamo.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId: auth.userId },
        ProjectionExpression: '#n',
        ExpressionAttributeNames: { '#n': 'name' },
      })
    );
    const createdByName = userResult.Item?.name || 'Unknown';

    // Write notice
    const noticeId = uuid();
    const now = new Date().toISOString();

    const noticeItem: Record<string, any> = {
      noticeId,
      scope,
      title,
      body: noticeBody,
      createdBy: auth.userId,
      createdByName,
      createdAt: now,
    };

    if (scope === 'subject') {
      noticeItem.classId = classId;
      noticeItem.subject = subject;
      noticeItem['classId#subject'] = `${classId}#${subject}`;
    }

    await dynamo.send(
      new PutCommand({
        TableName: NOTICES_TABLE,
        Item: noticeItem,
      })
    );

    // Fan-out push notifications
    let sent = 0;

    if (scope === 'global') {
      sent = await pushToAllActiveUsers(title);
    } else {
      sent = await pushToSubjectStudents(classId, subject, title, auth.userId);
    }

    return ok({ noticeId, sent });
  } catch (e: any) {
    if (e.statusCode) return err(e.statusCode, e.message);
    console.error('post-notice error:', e);
    return err(500, 'Internal server error');
  }
};

/**
 * Pushes to all active users with an FCM token.
 * Uses Scan with filter since we need ALL roles, not just one.
 */
async function pushToAllActiveUsers(title: string): Promise<number> {
  let sent = 0;
  let lastKey: any = undefined;

  do {
    const result = await dynamo.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: 'active = :active AND attribute_exists(fcmToken)',
        ExpressionAttributeValues: { ':active': true },
        ProjectionExpression: 'fcmToken',
        ExclusiveStartKey: lastKey,
      })
    );

    for (const user of result.Items || []) {
      if (user.fcmToken) {
        await sendPush(user.fcmToken as string, 'New Notice', title);
        sent++;
      }
    }

    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return sent;
}

/**
 * Pushes to students enrolled in a specific class+subject and the posting teacher.
 */
async function pushToSubjectStudents(
  classId: string,
  subject: string,
  title: string,
  teacherId: string
): Promise<number> {
  let sent = 0;

  // Query enrolled students via ClassSubjectIndex
  const enrolledResult = await dynamo.send(
    new QueryCommand({
      TableName: STUDENT_SUBJECTS_TABLE,
      IndexName: 'ClassSubjectIndex',
      KeyConditionExpression: '#cks = :cks',
      ExpressionAttributeNames: { '#cks': 'classId#subject' },
      ExpressionAttributeValues: { ':cks': `${classId}#${subject}` },
    })
  );

  const studentIds = (enrolledResult.Items || []).map((i) => i.studentId as string);

  // Collect FCM tokens for enrolled students + the teacher
  const allUserIds = [...new Set([...studentIds, teacherId])];

  for (const userId of allUserIds) {
    const userResult = await dynamo.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
        ProjectionExpression: 'fcmToken',
      })
    );

    const fcmToken = userResult.Item?.fcmToken;
    if (fcmToken) {
      await sendPush(fcmToken as string, 'Subject Notice', title);
      sent++;
    }
  }

  return sent;
}

/**
 * Sends a push notification via SNS → FCM.
 */
async function sendPush(fcmToken: string, pushTitle: string, pushBody: string): Promise<void> {
  try {
    const endpointResult = await snsClient.send(
      new CreatePlatformEndpointCommand({
        PlatformApplicationArn: SNS_FCM_ARN,
        Token: fcmToken,
      })
    );

    const endpointArn = endpointResult.EndpointArn;
    if (!endpointArn) return;

    await snsClient.send(
      new PublishCommand({
        TargetArn: endpointArn,
        Message: JSON.stringify({
          GCM: JSON.stringify({
            notification: {
              title: pushTitle,
              body: pushBody,
            },
          }),
        }),
        MessageStructure: 'json',
      })
    );
  } catch (e) {
    // Don't fail the notice creation if push fails
    console.error(`Push failed for token ${fcmToken.slice(0, 10)}...`, e);
  }
}
