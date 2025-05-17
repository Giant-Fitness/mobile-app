// app.config.js

module.exports = ({ config }) => {
    return {
        ...config,
        // Set scheme at root level (used primarily for Android)
        scheme: 'giantfitness',
        ios: {
            ...config.ios,
            // Remove the scheme property from here
            infoPlist: {
                ...config.ios.infoPlist,
                CFBundleURLTypes: [
                    {
                        CFBundleURLSchemes: ['com.giantfitness.kyn', 'com.googleusercontent.apps.139187083800-mon0i5bgpk2a0huc6hum3d43300a311h'],
                    },
                ],
            },
        },
        android: {
            ...config.android,
            package: 'com.giantfitness.kyn',
            // Remove the scheme property from here
            intentFilters: [
                {
                    action: 'VIEW',
                    autoVerify: true,
                    data: [
                        {
                            scheme: 'giantfitness',
                        },
                    ],
                    category: ['BROWSABLE', 'DEFAULT'],
                },
            ],
        },
        plugins: [...config.plugins],
    };
};
