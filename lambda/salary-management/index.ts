import {
  PutCommand,
  UpdateCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { PublishCommand, CreatePlatformEndpointCommand } from '@aws-sdk/client-sns';
import { dynamo } from '../shared/dynamo';
import { snsClient } from '../shared/sns';
import { requireAuth, requireRole } from '../shared/auth';
import { ok, err } from '../shared/response';

const SALARY_TABLE = process.env.SALARY_TABLE!;
const USERS_TABLE = process.env.USERS_TABLE!;
const SNS_FCM_ARN = process.env.SNS_FCM_ARN!;

const MONTH_LABELS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Routes:
 *   POST /salary                            → createSalary (admin)
 *   PUT  /salary/{teacherId}/{monthYear}    → markPaid (admin)
 *   GET  /salary/{teacherId}                → getSalaryHistory (admin: any, teacher: own only)
 */
export const handler = async (event: any) => {
  try {
    const auth = await requireAuth(event);
    const method = event.httpMethod;
    const path = event.resource;

    if (method === 'POST' && path === '/salary') {
      requireRole(auth.role, 'admin');
      return handleCreateSalary(event, auth.userId);
    }

    if (method === 'PUT' && path === '/salary/{teacherId}/{monthYear}') {
      requireRole(auth.role, 'admin');
      return handleMarkPaid(event);
    }

    if (method === 'GET' && path === '/salary/{teacherId}') {
      return handleGetSalary(event, auth);
    }

    return err(404, 'Route not found');
  } catch (e: any) {
    if (e.statusCode) return err(e.statusCode, e.message);
    console.error('salary-management error:', e);
    return err(500, 'Internal server error');
  }
};

// ─── POST /salary → Create salary record ────────────────────

async function handleCreateSalary(event: any, adminUserId: string) {
  const body = JSON.parse(event.body || '{}');
  const { teacherId, monthYear, amount, note } = body;

  if (!teacherId || !monthYear || amount === undefined) {
    return err(400, 'teacherId, monthYear, and amount are required');
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return err(400, 'amount must be a positive number');
  }

  await dynamo.send(
    new PutCommand({
      TableName: SALARY_TABLE,
      Item: {
        teacherId,
        monthYear,
        amount,
        status: 'pending',
        note: note || null,
        createdBy: adminUserId,
      },
    })
  );

  return ok({ teacherId, monthYear, status: 'pending' });
}

// ─── PUT /salary/{teacherId}/{monthYear} → Mark paid ────────

async function handleMarkPaid(event: any) {
  const { teacherId, monthYear } = event.pathParameters || {};
  if (!teacherId || !monthYear) {
    return err(400, 'teacherId and monthYear path parameters are required');
  }

  const now = new Date().toISOString();

  // Get the salary record first (for the amount in push notification)
  const salaryResult = await dynamo.send(
    new GetCommand({
      TableName: SALARY_TABLE,
      Key: { teacherId, monthYear },
    })
  );

  if (!salaryResult.Item) {
    return err(404, 'Salary record not found');
  }

  const amount = salaryResult.Item.amount;

  // Update status to paid
  await dynamo.send(
    new UpdateCommand({
      TableName: SALARY_TABLE,
      Key: { teacherId, monthYear },
      UpdateExpression: 'SET #status = :paid, paidAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':paid': 'paid',
        ':now': now,
      },
    })
  );

  // Send push to teacher
  const userResult = await dynamo.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: teacherId },
      ProjectionExpression: 'fcmToken',
    })
  );

  const fcmToken = userResult.Item?.fcmToken;
  if (fcmToken) {
    // Format month label from YYYY-MM
    const [year, month] = monthYear.split('-');
    const monthLabel = `${MONTH_LABELS[parseInt(month, 10)] || month} ${year}`;
    const formattedAmount = new Intl.NumberFormat('en-IN').format(amount);

    await sendPush(
      fcmToken,
      'Salary Credited',
      `Your salary of ₹${formattedAmount} for ${monthLabel} has been credited`
    );
  }

  return ok({ teacherId, monthYear, status: 'paid', paidAt: now });
}

// ─── GET /salary/{teacherId} → Salary history ───────────────

async function handleGetSalary(event: any, auth: { userId: string; role: string }) {
  const teacherId = event.pathParameters?.teacherId;
  if (!teacherId) return err(400, 'teacherId path parameter is required');

  // Teacher can only read own salary
  if (auth.role === 'teacher' && auth.userId !== teacherId) {
    return err(403, 'Teachers can only view their own salary');
  }

  // Admin and matching teacher both proceed
  requireRole(auth.role, 'admin', 'teacher');

  const result = await dynamo.send(
    new QueryCommand({
      TableName: SALARY_TABLE,
      KeyConditionExpression: 'teacherId = :tid',
      ExpressionAttributeValues: { ':tid': teacherId },
      ScanIndexForward: false, // newest first
    })
  );

  return ok({ items: result.Items || [] });
}

// ─── Push helper ─────────────────────────────────────────────

async function sendPush(fcmToken: string, title: string, body: string): Promise<void> {
  try {
    const endpointResult = await snsClient.send(
      new CreatePlatformEndpointCommand({
        PlatformApplicationArn: SNS_FCM_ARN,
        Token: fcmToken,
      })
    );

    if (!endpointResult.EndpointArn) return;

    await snsClient.send(
      new PublishCommand({
        TargetArn: endpointResult.EndpointArn,
        Message: JSON.stringify({
          GCM: JSON.stringify({
            notification: { title, body },
          }),
        }),
        MessageStructure: 'json',
      })
    );
  } catch (e) {
    console.error(`Push failed for token ${fcmToken.slice(0, 10)}...`, e);
  }
}
