import { QueryCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { PublishCommand, CreatePlatformEndpointCommand } from '@aws-sdk/client-sns';
import { dynamo } from '../shared/dynamo';
import { snsClient } from '../shared/sns';

const FEES_TABLE = process.env.FEES_TABLE!;
const USERS_TABLE = process.env.USERS_TABLE!;
const SNS_FCM_ARN = process.env.SNS_FCM_ARN!;

/**
 * EventBridge CRON — runs at 9:00 AM IST on 1st of every month.
 * Queries pending fees with dueDate < today → marks overdue → sends push.
 */
export const handler = async () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  let processed = 0;
  let lastKey: any = undefined;

  do {
    // Query fees that are 'pending' and past due
    const result = await dynamo.send(
      new QueryCommand({
        TableName: FEES_TABLE,
        IndexName: 'StatusDueDateIndex',
        KeyConditionExpression: '#status = :pending AND dueDate <= :today',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':pending': 'pending',
          ':today': today,
        },
        ExclusiveStartKey: lastKey,
      })
    );

    for (const fee of result.Items || []) {
      try {
        // Mark as overdue
        await dynamo.send(
          new UpdateCommand({
            TableName: FEES_TABLE,
            Key: {
              studentId: fee.studentId,
              monthYear: fee.monthYear,
            },
            UpdateExpression: 'SET #status = :overdue',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':overdue': 'overdue' },
          })
        );

        // Fetch student's FCM token
        const userResult = await dynamo.send(
          new GetCommand({
            TableName: USERS_TABLE,
            Key: { userId: fee.studentId },
            ProjectionExpression: 'fcmToken, #n',
            ExpressionAttributeNames: { '#n': 'name' },
          })
        );

        const fcmToken = userResult.Item?.fcmToken;
        if (fcmToken) {
          await sendPush(
            fcmToken,
            'Fee Overdue',
            `Your fee for ${fee.monthYear} is overdue. Please pay at the earliest.`
          );
        }

        processed++;
      } catch (e) {
        console.error(`Failed to process fee for ${fee.studentId}/${fee.monthYear}:`, e);
      }
    }

    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  console.log(`Fee reminder processed: ${processed} overdue fees`);
  return { processed };
};

/**
 * Sends push via SNS → FCM.
 */
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
