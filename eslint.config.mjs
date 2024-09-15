import react from 'eslint-plugin-react';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import globals from 'globals';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';

export default [
    reactRecommended,
    {
        files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: typescriptParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },
        rules: {
            // Disable react/prop-types for TypeScript files
            'react/prop-types': 'off',
            // Add other rules as needed
        },
    },
    {
        ignores: ['.expo/*'],
    },
    {
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
];
