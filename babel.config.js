module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            [
                'babel-preset-expo',
                {
                    jsxRuntime: 'automatic',
                },
            ],
        ],
        plugins: ['react-native-paper/babel', 'react-native-reanimated/plugin'],
    };
};
