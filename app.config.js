// app.config.js

module.exports = ({ config }) => {
    return {
        ...config,
        ios: {
            ...config.ios,
            infoPlist: {
                ...config.ios.infoPlist,
                CFBundleURLTypes: [
                    {
                        CFBundleURLSchemes: ['com.giantfitness.kyn', 'com.googleusercontent.apps.139187083800-mon0i5bgpk2a0huc6hum3d43300a311h'],
                    },
                ],
            },
            icon: {
                dark: './assets/icons/ios-dark.png',
                light: './assets/icons/ios-dark.png',
                tinted: './assets/icons/ios-tinted.png',
            },
        },
        android: {
            ...config.android,
            scheme: 'giantfitness',
            package: 'com.giantfitness.kyn',
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
            adaptiveIcon: {
                foregroundImage: './assets/icons/adaptive-icon.png',
                monochromeImage: './assets/icons/adaptive-icon.png',
                backgroundColor: '#090909',
            },
        },
        plugins: [...config.plugins],
    };
};
