import { AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '../shared/cognito';

const VALID_ROLES = ['admin', 'teacher', 'student'];

/**
 * Cognito PostConfirmation trigger.
 * Reads custom:role → AdminAddUserToGroup.
 * Returns event unchanged (Cognito requires this).
 */
export const handler = async (event: any): Promise<any> => {
  const role = event.request.userAttributes['custom:role'];

  if (!role || !VALID_ROLES.includes(role)) {
    console.error(`Invalid or missing custom:role: "${role}"`);
    return event;
  }

  try {
    await cognitoClient.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: event.userPoolId,
        Username: event.userName,
        GroupName: role,
      })
    );
    console.log(`Added user ${event.userName} to group "${role}"`);
  } catch (error) {
    console.error('Failed to add user to group:', error);
    // Don't throw — Cognito would block the user from being confirmed
  }

  return event;
};
