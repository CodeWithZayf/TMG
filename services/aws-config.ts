import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID!,
      signUpVerificationMethod: 'code',
    },
  },
  API: {
    REST: {
      TMGApi: {
        endpoint: process.env.EXPO_PUBLIC_API_GATEWAY_URL!,
        region: process.env.EXPO_PUBLIC_AWS_REGION!,
      },
    },
  },
});
