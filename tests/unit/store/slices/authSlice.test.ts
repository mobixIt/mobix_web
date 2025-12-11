import { describe, it, expect } from 'vitest';
import authReducer, {
  clearAuth,
  fetchMe,
  selectAuthError,
  selectAuthErrorStatus,
  selectAuthStatus,
  selectCurrentPerson,
} from '@/store/slices/authSlice';
import type { AuthState } from '@/store/slices/authSlice';
import type { RootState } from '@/store/store';
import type { MeResponse } from '@/types/access-control';

function buildAuthState(partial: Partial<AuthState> = {}): AuthState {
  return {
    me: null,
    status: 'idle',
    error: null,
    errorStatus: null,
    ...partial,
  };
}

function buildRootStateWithAuth(authState: AuthState): RootState {
  return {
    auth: authState,
  } as unknown as RootState;
}

describe('authSlice reducer state transitions', () => {
  it('returns initial state when reducer is called with undefined state and unknown action', () => {
    const nextState = authReducer(undefined, { type: 'unknown/action' });
    expect(nextState).toEqual(buildAuthState());
  });

  it('clearAuth resets state to initial values from a populated state', () => {
    const populatedState: AuthState = buildAuthState({
      me: { id: 'user-1', first_name: 'John', last_name: 'Doe', email: 'john@example.com', phone: null } as unknown as MeResponse,
      status: 'succeeded',
      error: 'Some error',
      errorStatus: 401,
    });

    const nextState = authReducer(populatedState, clearAuth());

    expect(nextState.me).toBeNull();
    expect(nextState.status).toBe('idle');
    expect(nextState.error).toBeNull();
    expect(nextState.errorStatus).toBeNull();
  });

  it('sets loading status and clears previous error information when fetchMe is pending', () => {
    const prevState: AuthState = buildAuthState({
      me: { id: 'user-1', first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com', phone: null } as unknown as MeResponse,
      status: 'failed',
      error: 'Previous error',
      errorStatus: 500,
    });

    const action = fetchMe.pending('req-1', undefined);
    const nextState = authReducer(prevState, action);

    expect(nextState.status).toBe('loading');
    expect(nextState.error).toBeNull();
    expect(nextState.errorStatus).toBeNull();
    expect(nextState.me).toEqual(prevState.me);
  });

  it('stores user information and sets succeeded status when fetchMe is fulfilled', () => {
    const prevState: AuthState = buildAuthState({
      status: 'loading',
      error: 'Previous error',
      errorStatus: 500,
    });

    const mePayload: MeResponse = {
      id: 'user-123',
      first_name: 'Alice',
      last_name: 'Smith',
      email: 'alice@example.com',
      phone: null,
    } as unknown as MeResponse;

    const action = fetchMe.fulfilled(mePayload, 'req-2', undefined);
    const nextState = authReducer(prevState, action);

    expect(nextState.status).toBe('succeeded');
    expect(nextState.me).toEqual(mePayload);
    expect(nextState.errorStatus).toBeNull();
  });

  it('sets failed status and stores structured error when fetchMe is rejected with payload', () => {
    const prevState: AuthState = buildAuthState({
      status: 'loading',
      me: { id: 'user-1', first_name: 'Old', last_name: 'User', email: 'old@example.com', phone: null } as unknown as MeResponse,
    });

    const errorPayload = { message: 'Unauthorized', status: 401 };
    const action = fetchMe.rejected(new Error('Unauthorized'), 'req-3', undefined, errorPayload);

    const nextState = authReducer(prevState, action);

    expect(nextState.status).toBe('failed');
    expect(nextState.error).toBe('Unauthorized');
    expect(nextState.errorStatus).toBe(401);
    expect(nextState.me).toBeNull();
  });

  it('sets generic error and null status when fetchMe is rejected without payload', () => {
    const prevState: AuthState = buildAuthState({
      status: 'loading',
      me: { id: 'user-2', first_name: 'Temp', last_name: 'User', email: 'temp@example.com', phone: null } as unknown as MeResponse,
    });

    const action = fetchMe.rejected(new Error('Network error'), 'req-4', undefined);

    const nextState = authReducer(prevState, action);

    expect(nextState.status).toBe('failed');
    expect(nextState.error).toBe('Error desconocido');
    expect(nextState.errorStatus).toBeNull();
    expect(nextState.me).toBeNull();
  });
});

describe('authSlice selectors behavior with valid state', () => {
  it('selectCurrentPerson returns the me object from auth state', () => {
    const me: MeResponse = {
      id: 'user-10',
      first_name: 'Carlos',
      last_name: 'Rangel',
      email: 'carlos@example.com',
      phone: null,
    } as unknown as MeResponse;

    const state = buildRootStateWithAuth(buildAuthState({ me }));

    const result = selectCurrentPerson(state);
    expect(result).toEqual(me);
  });

  it('selectCurrentPerson returns null when user is not authenticated', () => {
    const state = buildRootStateWithAuth(buildAuthState({ me: null }));
    const result = selectCurrentPerson(state);
    expect(result).toBeNull();
  });

  it('selectAuthStatus returns current auth status value', () => {
    const state = buildRootStateWithAuth(buildAuthState({ status: 'succeeded' }));
    const result = selectAuthStatus(state);
    expect(result).toBe('succeeded');
  });

  it('selectAuthError returns current auth error message or null', () => {
    const stateWithError = buildRootStateWithAuth(buildAuthState({ error: 'Invalid token' }));
    const stateWithoutError = buildRootStateWithAuth(buildAuthState({ error: null }));

    expect(selectAuthError(stateWithError)).toBe('Invalid token');
    expect(selectAuthError(stateWithoutError)).toBeNull();
  });

  it('selectAuthErrorStatus returns current errorStatus or null', () => {
    const stateWithStatus = buildRootStateWithAuth(buildAuthState({ errorStatus: 401 }));
    const stateWithoutStatus = buildRootStateWithAuth(buildAuthState({ errorStatus: null }));

    expect(selectAuthErrorStatus(stateWithStatus)).toBe(401);
    expect(selectAuthErrorStatus(stateWithoutStatus)).toBeNull();
  });
});
