# Testing Guide for Kyn Mobile App

This guide provides comprehensive information on testing the Kyn mobile application, including setup, writing tests, running tests, and best practices.

## Table of Contents

1. [Testing Framework Overview](#testing-framework-overview)
2. [Running Tests](#running-tests)
3. [Writing Tests](#writing-tests)
4. [Test Structure](#test-structure)
5. [Testing Utilities](#testing-utilities)
6. [Testing Components](#testing-components)
7. [Testing Redux State](#testing-redux-state)
8. [Testing Async Operations](#testing-async-operations)
9. [Mocking](#mocking)
10. [Code Coverage](#code-coverage)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

## Testing Framework Overview

The Kyn mobile app uses the following testing stack:

- **Jest**: JavaScript testing framework
- **jest-expo**: Jest preset for Expo apps
- **@testing-library/react-native**: Testing utilities for React Native components
- **@testing-library/jest-native**: Custom matchers for React Native

### Key Features

- **Unit Testing**: Test individual functions and utilities
- **Component Testing**: Test React Native components in isolation
- **Integration Testing**: Test Redux slices and async operations
- **Snapshot Testing**: Visual regression testing (optional)
- **Coverage Reports**: Track code coverage metrics

## Running Tests

### Run All Tests

```bash
yarn test
```

### Run Tests in Watch Mode

```bash
yarn test --watch
```

### Run Tests with Coverage

```bash
yarn test --coverage
```

### Run Specific Test File

```bash
yarn test utils/unitConversion.test
```

### Run Tests Matching Pattern

```bash
yarn test --testNamePattern="should convert kilograms"
```

### Update Snapshots

```bash
yarn test -u
```

## Writing Tests

### Basic Test Structure

```typescript
import { functionToTest } from '../module';

describe('Module Name', () => {
  describe('functionToTest', () => {
    it('should do something specific', () => {
      const result = functionToTest(input);
      expect(result).toBe(expectedOutput);
    });

    it('should handle edge cases', () => {
      expect(functionToTest(edgeCase)).toBe(expected);
    });
  });
});
```

### Test File Naming

- Place tests in `__tests__` directories
- Name test files with `.test.ts` or `.test.tsx` extension
- Match the name of the file being tested: `utils/cache.ts` → `utils/__tests__/cache.test.ts`

## Test Structure

### Organize Tests with Describe Blocks

```typescript
describe('CacheService', () => {
  describe('set and get', () => {
    it('should store and retrieve data', () => {
      // test implementation
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', () => {
      // test implementation
    });
  });
});
```

### Setup and Teardown

```typescript
describe('Component', () => {
  beforeEach(() => {
    // Runs before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Runs after each test
    cleanup();
  });

  beforeAll(() => {
    // Runs once before all tests
  });

  afterAll(() => {
    // Runs once after all tests
  });
});
```

## Testing Utilities

### Example: Testing Unit Conversion

```typescript
import { kgToPounds, poundsToKg } from '../unitConversion';

describe('unitConversion', () => {
  describe('kgToPounds', () => {
    it('should convert kilograms to pounds correctly', () => {
      expect(kgToPounds(100)).toBe(220.5);
      expect(kgToPounds(0)).toBe(0);
    });

    it('should round to 1 decimal place', () => {
      expect(kgToPounds(50.555)).toBe(111.5);
    });
  });
});
```

### Example: Testing Calendar Utilities

```typescript
import { getWeekNumber, getDayOfWeek } from '../calendar';

describe('calendar utilities', () => {
  describe('getWeekNumber', () => {
    it('should calculate week number correctly', () => {
      expect(getWeekNumber(1)).toBe(1);
      expect(getWeekNumber(8)).toBe(2);
    });

    it('should return 0 for invalid dayId', () => {
      expect(getWeekNumber(0)).toBe(0);
    });
  });
});
```

## Testing Components

### Basic Component Test

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../ThemedText';

describe('ThemedText', () => {
  it('should render with text', () => {
    const { getByText } = render(<ThemedText>Hello</ThemedText>);
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

### Testing User Interactions

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from '../PrimaryButton';

describe('PrimaryButton', () => {
  it('should call onPress when clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <PrimaryButton text="Click Me" onPress={onPressMock} />
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <PrimaryButton text="Click" onPress={onPressMock} disabled />
    );

    fireEvent.press(getByText('Click'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
```

### Testing Component Props

```typescript
it('should apply custom styles', () => {
  const { getByText } = render(
    <ThemedText style={{ fontSize: 20 }}>Custom</ThemedText>
  );
  const element = getByText('Custom');
  expect(element.props.style).toContainEqual(
    expect.objectContaining({ fontSize: 20 })
  );
});
```

## Testing Redux State

### Testing Reducers

```typescript
import userReducer, { clearError } from '../userSlice';
import { initialState } from '../userState';

describe('userSlice', () => {
  it('should return initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Error' };
    const state = userReducer(stateWithError, clearError());
    expect(state.error).toBeNull();
  });
});
```

### Testing Async Thunks

```typescript
import { getUserAsync } from '../thunks';
import { REQUEST_STATE } from '@/constants/requestStates';

describe('getUserAsync', () => {
  it('should set pending state', () => {
    const action = { type: getUserAsync.pending.type };
    const state = userReducer(initialState, action);

    expect(state.userState).toBe(REQUEST_STATE.PENDING);
    expect(state.error).toBeNull();
  });

  it('should set fulfilled state with data', () => {
    const mockUser = { UserId: '123', Email: 'test@example.com' };
    const action = { type: getUserAsync.fulfilled.type, payload: mockUser };
    const state = userReducer(initialState, action);

    expect(state.userState).toBe(REQUEST_STATE.FULFILLED);
    expect(state.user).toEqual(mockUser);
  });
});
```

## Testing Async Operations

### Using Fake Timers

```typescript
describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce calls', () => {
    const mockFn = jest.fn();
    debounce(mockFn, 150);
    debounce(mockFn, 150);

    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(150);
    debounce(mockFn, 150);

    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
```

### Testing Promises

```typescript
it('should handle async operations', async () => {
  const data = { name: 'Test' };
  await cacheService.set('key', data, CacheTTL.SHORT);
  const retrieved = await cacheService.get('key');

  expect(retrieved).toEqual(data);
});
```

## Mocking

### Mocking Modules

```typescript
// Mock external libraries
jest.mock('expo-font');
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));
```

### Mocking Functions

```typescript
const mockFunction = jest.fn();
mockFunction.mockReturnValue('mocked value');
mockFunction.mockResolvedValue('async value');
mockFunction.mockRejectedValue(new Error('error'));
```

### Mocking AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});
```

### Spy on Functions

```typescript
it('should log errors', () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

  // code that logs errors

  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
});
```

## Code Coverage

### Coverage Thresholds

The project has the following coverage thresholds (configured in `jest.config.js`):

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### Viewing Coverage Reports

After running `yarn test --coverage`:

- HTML report: `coverage/lcov-report/index.html`
- Terminal summary shows overall coverage

### Coverage Best Practices

- Aim for >80% coverage on critical paths
- 100% coverage isn't always necessary
- Focus on testing business logic and edge cases
- Use coverage to find untested code, not as the only metric

## Best Practices

### 1. Write Descriptive Test Names

```typescript
// Good
it('should return 0 when converting invalid string to weight', () => {});

// Bad
it('converts weight', () => {});
```

### 2. Test One Thing Per Test

```typescript
// Good
it('should store data', async () => {
  await cacheService.set('key', 'value', CacheTTL.SHORT);
  const exists = await cacheService.exists('key');
  expect(exists).toBe(true);
});

it('should retrieve stored data', async () => {
  await cacheService.set('key', 'value', CacheTTL.SHORT);
  const value = await cacheService.get('key');
  expect(value).toBe('value');
});

// Bad - testing multiple behaviors
it('should store and retrieve and delete data', async () => {
  // too many assertions
});
```

### 3. Use Arrange-Act-Assert Pattern

```typescript
it('should convert pounds to kg', () => {
  // Arrange
  const pounds = 220;

  // Act
  const kg = poundsToKg(pounds);

  // Assert
  expect(kg).toBeCloseTo(100, 1);
});
```

### 4. Test Edge Cases

```typescript
describe('getWeekNumber', () => {
  it('should handle normal cases', () => {
    expect(getWeekNumber(7)).toBe(1);
  });

  it('should handle edge cases', () => {
    expect(getWeekNumber(0)).toBe(0);
    expect(getWeekNumber(-1)).toBe(0);
    expect(getWeekNumber(1)).toBe(1);
  });
});
```

### 5. Clean Up After Tests

```typescript
afterEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});
```

### 6. Avoid Testing Implementation Details

```typescript
// Good - test behavior
it('should display user name', () => {
  const { getByText } = render(<UserProfile user={{ name: 'John' }} />);
  expect(getByText('John')).toBeTruthy();
});

// Bad - test implementation
it('should call formatName function', () => {
  // don't test internal functions
});
```

### 7. Use Test Data Builders

```typescript
const createMockUser = (overrides = {}) => ({
  UserId: '123',
  Email: 'test@example.com',
  FirstName: 'Test',
  LastName: 'User',
  ...overrides,
});

it('should handle user', () => {
  const user = createMockUser({ FirstName: 'John' });
  // use user in test
});
```

## Troubleshooting

### Common Issues

#### Tests Timeout

```typescript
// Increase timeout for slow tests
jest.setTimeout(10000);

// Or per test
it('slow test', async () => {
  // test code
}, 10000);
```

#### Module Not Found

- Check `jest.config.js` moduleNameMapper
- Verify file paths match
- Clear Jest cache: `yarn jest --clearCache`

#### Async Tests Hang

```typescript
// Make sure to return promises or use async/await
it('async test', async () => {
  await asyncOperation();
  expect(result).toBe(expected);
});
```

#### Mock Not Working

```typescript
// Place mocks before imports
jest.mock('../module');
import { function } from '../module';

// Or use require
jest.mock('../module', () => ({
  function: jest.fn(),
}));
```

### Debugging Tests

```typescript
// Use console.log
it('debug test', () => {
  console.log('value:', value);
  expect(value).toBe(expected);
});

// Use debugger
it('debug test', () => {
  debugger; // Node will pause here
  expect(value).toBe(expected);
});
```

### Run Tests in Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Test Coverage Checklist

### Utilities
- ✅ Unit conversion functions
- ✅ Calendar utilities
- ✅ Color utilities
- ✅ Debounce function
- ✅ Cache service

### Components
- ✅ ThemedText component
- ✅ PrimaryButton component
- ⏳ All other UI components

### Redux
- ✅ User slice reducers
- ⏳ Other slices (programs, workouts, etc.)
- ⏳ Async thunks
- ⏳ Selectors

### Integration
- ⏳ API services
- ⏳ Authentication flow
- ⏳ Navigation

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Expo](https://docs.expo.dev/guides/testing-with-jest/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:

1. Write tests for new utilities and functions
2. Add component tests for new UI components
3. Update Redux tests for state changes
4. Maintain code coverage above 70%
5. Run tests before committing: `yarn test`

## Summary

Testing is a critical part of maintaining code quality in the Kyn mobile app. This guide provides:

- Comprehensive setup instructions
- Examples for different types of tests
- Best practices and patterns
- Troubleshooting tips

Keep tests simple, focused, and maintainable. Happy testing!
