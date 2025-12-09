import { debounce } from '../debounce';
import { Router } from 'expo-router';

describe('debounce', () => {
  let mockRouter: Router;

  beforeEach(() => {
    jest.useFakeTimers();
    mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call router.push on first call', () => {
    const path = '/test';
    debounce(mockRouter, path);
    expect(mockRouter.push).toHaveBeenCalledWith(path);
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
  });

  it('should not call router.push on subsequent calls within debounce time', () => {
    const path = '/test';
    debounce(mockRouter, path);
    debounce(mockRouter, path);
    debounce(mockRouter, path);
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
  });

  it('should allow navigation after debounce time has passed', () => {
    const path = '/test';
    debounce(mockRouter, path);
    expect(mockRouter.push).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(150);
    debounce(mockRouter, path);
    expect(mockRouter.push).toHaveBeenCalledTimes(2);
  });

  it('should use custom debounce time when provided', () => {
    const path = '/test';
    const customDebounceTime = 300;

    debounce(mockRouter, path, customDebounceTime);
    expect(mockRouter.push).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(150);
    debounce(mockRouter, path, customDebounceTime);
    expect(mockRouter.push).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(150);
    debounce(mockRouter, path, customDebounceTime);
    expect(mockRouter.push).toHaveBeenCalledTimes(2);
  });

  it('should handle different paths correctly', () => {
    const path1 = '/test1';
    const path2 = '/test2';

    debounce(mockRouter, path1);
    expect(mockRouter.push).toHaveBeenCalledWith(path1);

    jest.advanceTimersByTime(150);
    debounce(mockRouter, path2);
    expect(mockRouter.push).toHaveBeenCalledWith(path2);
    expect(mockRouter.push).toHaveBeenCalledTimes(2);
  });
});
