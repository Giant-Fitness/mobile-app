import userReducer, { clearError } from '../user/userSlice';
import { initialState } from '../user/userState';
import { REQUEST_STATE } from '@/constants/requestStates';
import { getUserAsync, updateUserAsync } from '../user/thunks';

describe('userSlice', () => {
  describe('reducers', () => {
    it('should return initial state', () => {
      expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
      };

      const state = userReducer(stateWithError, clearError());
      expect(state.error).toBeNull();
    });
  });

  describe('getUserAsync', () => {
    it('should set pending state when getUserAsync is pending', () => {
      const action = { type: getUserAsync.pending.type };
      const state = userReducer(initialState, action);

      expect(state.userState).toBe(REQUEST_STATE.PENDING);
      expect(state.error).toBeNull();
    });

    it('should set fulfilled state and user data when getUserAsync is fulfilled', () => {
      const mockUser = {
        UserId: '123',
        Email: 'test@example.com',
        FirstName: 'Test',
        LastName: 'User',
      };

      const action = {
        type: getUserAsync.fulfilled.type,
        payload: mockUser,
      };

      const state = userReducer(initialState, action);

      expect(state.userState).toBe(REQUEST_STATE.FULFILLED);
      expect(state.user).toEqual(mockUser);
    });

    it('should set rejected state and error when getUserAsync is rejected', () => {
      const action = {
        type: getUserAsync.rejected.type,
        error: { message: 'Failed to fetch' },
      };

      const state = userReducer(initialState, action);

      expect(state.userState).toBe(REQUEST_STATE.REJECTED);
      expect(state.error).toBe('Failed to fetch');
    });

    it('should use default error message if no error message provided', () => {
      const action = {
        type: getUserAsync.rejected.type,
        error: {},
      };

      const state = userReducer(initialState, action);

      expect(state.error).toBe('Failed to fetch user');
    });
  });

  describe('updateUserAsync', () => {
    it('should set pending state when updateUserAsync is pending', () => {
      const action = { type: updateUserAsync.pending.type };
      const state = userReducer(initialState, action);

      expect(state.userState).toBe(REQUEST_STATE.PENDING);
      expect(state.error).toBeNull();
    });

    it('should update user data when updateUserAsync is fulfilled', () => {
      const mockUser = {
        UserId: '123',
        Email: 'updated@example.com',
        FirstName: 'Updated',
        LastName: 'User',
      };

      const action = {
        type: updateUserAsync.fulfilled.type,
        payload: mockUser,
      };

      const state = userReducer(initialState, action);

      expect(state.userState).toBe(REQUEST_STATE.FULFILLED);
      expect(state.user).toEqual(mockUser);
    });

    it('should set error when updateUserAsync is rejected', () => {
      const action = {
        type: updateUserAsync.rejected.type,
        error: { message: 'Update failed' },
      };

      const state = userReducer(initialState, action);

      expect(state.userState).toBe(REQUEST_STATE.REJECTED);
      expect(state.error).toBe('Update failed');
    });
  });
});
