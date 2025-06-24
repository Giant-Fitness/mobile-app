// @ts-check

/** @type {import("prettier").Config} */
module.exports = {
    // Your existing prettier options
    arrowParens: 'always',
    bracketSpacing: true,
    semi: true,
    singleQuote: true,
    jsxSingleQuote: true,
    quoteProps: 'as-needed',
    trailingComma: 'all',
    htmlWhitespaceSensitivity: 'css',
    vueIndentScriptAndStyle: false,
    proseWrap: 'preserve',
    insertPragma: false,
    printWidth: 160,
    requirePragma: false,
    tabWidth: 4,
    useTabs: false,
    embeddedLanguageFormatting: 'auto',

    // Since prettier 3.0, manually specifying plugins is required
    plugins: ['@ianvs/prettier-plugin-sort-imports'],

    // Import sorting options (correct format)
    importOrder: ['^react$', '^react-native$', '', '^@expo/(.*)$', '^expo-(.*)$', '', '^@react-navigation/(.*)$', '', '^@?\\w', '', '^[./]'],
    importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
    importOrderTypeScriptVersion: '5.0.0',
    importOrderCaseSensitive: false,
};
