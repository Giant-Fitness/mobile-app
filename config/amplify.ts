// config/amplify.ts

import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

export const configureAmplify = () => {
    try {
        Amplify.configure({
            Auth: {
                Cognito: {
                    userPoolId: outputs.auth.Cognito.userPoolId,
                    userPoolClientId: outputs.auth.Cognito.userPoolClientId,
                    identityPoolId: outputs.auth.Cognito.identityPoolId,
                },
            },
        });
        return true;
    } catch (error) {
        console.error('Amplify configuration error:', error);
        return false;
    }
};
