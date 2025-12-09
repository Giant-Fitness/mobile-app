module.exports = {
  preset: 'jest-expo/universal',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@aws-amplify|aws-amplify|@reduxjs/toolkit|victory-native|lucide-react-native|react-native-reanimated)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/*.config.{js,ts}',
    '!**/coverage/**',
    '!**/amplify/**',
    '!**/__tests__/**',
    '!**/__mocks__/**',
  ],
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
    '**/*.test.{ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@store/(.*)$': '<rootDir>/store/$1',
    '^@hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@types/(.*)$': '<rootDir>/types/$1',
    '^@constants/(.*)$': '<rootDir>/constants/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
  },
  testEnvironment: 'node',
  projects: [
    {
      preset: 'jest-expo/universal',
      displayName: 'default',
      testEnvironment: 'node',
    },
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
