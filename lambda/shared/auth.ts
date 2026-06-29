import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: 'id',
  clientId: process.env.USER_POOL_CLIENT_ID!,
});

export interface AuthContext {
  userId: string;
  role: string;
}

/**
 * Verifies the JWT from the Authorization header and extracts userId + role.
 * Throws { statusCode, message } on failure.
 */
export async function requireAuth(event: any): Promise<AuthContext> {
  const token = event.headers?.Authorization?.replace('Bearer ', '')
    || event.headers?.authorization?.replace('Bearer ', '');
  if (!token) {
    throw { statusCode: 401, message: 'Missing Authorization header' };
  }

  const payload = await verifier.verify(token);
  const groups = (payload['cognito:groups'] as string[] | undefined) ?? [];
  const role = groups.find((g) => ['admin', 'teacher', 'student'].includes(g));

  if (!role) {
    throw { statusCode: 403, message: 'No valid role assigned' };
  }

  return { userId: payload.sub as string, role };
}

/**
 * Asserts the caller has one of the allowed roles.
 */
export function requireRole(actual: string, ...allowed: string[]): void {
  if (!allowed.includes(actual)) {
    throw { statusCode: 403, message: `Role '${actual}' not permitted` };
  }
}

/**
 * Verifies a teacher is assigned to a specific classId+subject.
 * Reads from TMG_TeacherAssignments.
 */
export async function requireTeacherAssignment(
  dynamo: DynamoDBDocumentClient,
  teacherId: string,
  classId: string,
  subject: string
): Promise<void> {
  const result = await dynamo.send(
    new GetCommand({
      TableName: process.env.TEACHER_ASSIGNMENTS_TABLE!,
      Key: {
        teacherId,
        'classId#subject': `${classId}#${subject}`,
      },
    })
  );

  if (!result.Item) {
    throw {
      statusCode: 403,
      message: 'Teacher not assigned to this class+subject',
    };
  }
}
