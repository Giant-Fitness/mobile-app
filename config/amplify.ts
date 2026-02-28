// config/amplify.ts

import { Platform } from 'react-native';

import { Amplify } from 'aws-amplify';

import outputs from '../amplify_outputs.json';

export const configureAmplify = () => {
    try {
        // Determine the platform-specific redirect URI
        const redirectSignIn = Platform.OS === 'android' ? ['giantfitness:/oauthredirect'] : ['com.giantfitness.kyn:/oauthredirect'];

        const redirectSignOut = Platform.OS === 'android' ? ['giantfitness:/'] : ['com.giantfitness.kyn:/'];

        Amplify.configure({
            Auth: {
                Cognito: {
                    userPoolId: outputs.auth.Cognito.userPoolId,
                    userPoolClientId: outputs.auth.Cognito.userPoolClientId,
                    identityPoolId: outputs.auth.Cognito.identityPoolId,
                    loginWith: {
                        oauth: {
                            domain: 'giant-fitness-prod.auth.ap-south-1.amazoncognito.com',
                            // domain: 'giant-fitness-dev.auth.ap-south-1.amazoncognito.com',
                            scopes: ['openid', 'email', 'profile', 'giant-fitness-api/user.read', 'giant-fitness-api/user.write'],
                            // Use platform-specific redirects only
                            redirectSignIn,
                            redirectSignOut,
                            responseType: 'code',
                            providers: ['Google', 'Apple'],
                        },
                    },
                },
            },
        });

        return true;
    } catch (error) {
        console.error('Amplify configuration error:', error);
        return false;
    }
};
