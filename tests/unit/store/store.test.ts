import { describe, it, expect } from 'vitest';
import { store } from '@/store/store';

describe('store wiring', () => {
  it('exposes the expected reducer keys in RootState', () => {
    const state = store.getState();

    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('permissions');
    expect(state).toHaveProperty('vehicles');
    expect(state).toHaveProperty('vehiclesStats');
    expect(state).toHaveProperty('vehiclesCatalogs');
  });

  it('can dispatch an action without crashing', () => {
    expect(() => store.dispatch({ type: 'store/testAction' })).not.toThrow();
  });

  it('initial state slices are defined', () => {
    const state = store.getState();

    expect(state.auth).toBeDefined();
    expect(state.permissions).toBeDefined();
    expect(state.vehicles).toBeDefined();
    expect(state.vehiclesStats).toBeDefined();
    expect(state.vehiclesCatalogs).toBeDefined();
  });
});
