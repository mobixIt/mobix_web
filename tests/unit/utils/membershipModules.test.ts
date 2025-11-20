import { describe, it, expect } from 'vitest';
import type { Membership } from '@/types/access-control';
import { buildEffectiveModulesFromMembership } from '@/utils/membershipModules';

describe('buildEffectiveModulesFromMembership', () => {
  const baseTenant = { id: 1, slug: 'coolitoral' };

  it('devuelve un array vacío cuando el membership no tiene roles', () => {
    const membership: Membership = {
      id: 1,
      active: true,
      tenant: baseTenant,
      roles: [],
    };

    const result = buildEffectiveModulesFromMembership(membership);

    expect(result).toEqual([]);
  });

  it('agrupa permisos por app_module y deduplica acciones por subject_class', () => {
    const membership: Membership = {
      id: 1,
      active: true,
      tenant: baseTenant,
      roles: [
        {
          id: 10,
          name: 'Manager',
          key: 'manager',
          tenant_permissions: [],
          permissions: [
            {
              id: 100,
              subject_class: 'Vehicle',
              action: 'read',
              app_module: {
                id: 1,
                name: 'Vehicles',
                description: 'Vehicles module',
                active: true,
              },
            },
            {
              id: 101,
              subject_class: 'Vehicle',
              action: 'update',
              app_module: {
                id: 1,
                name: 'Vehicles',
                description: 'Vehicles module',
                active: true,
              },
            },
          ],
        },
        {
          id: 11,
          name: 'Viewer',
          key: 'viewer',
          tenant_permissions: [],
          permissions: [
            {
              id: 102,
              subject_class: 'Vehicle',
              action: 'read', // duplicado a propósito
              app_module: {
                id: 1,
                name: 'Vehicles',
                description: 'Vehicles module',
                active: true,
              },
            },
          ],
        },
      ],
    };

    const result = buildEffectiveModulesFromMembership(membership);

    expect(result).toHaveLength(1);

    const mod = result[0];
    expect(mod.appModuleId).toBe(1);
    expect(mod.appModuleName).toBe('Vehicles');
    expect(mod.appModuleDescription).toBe('Vehicles module');
    expect(mod.appModuleActive).toBe(true);

    expect(Object.keys(mod.actionsBySubject)).toEqual(['Vehicle']);

    const actions = mod.actionsBySubject['Vehicle'];

    expect(actions.sort()).toEqual(['read', 'update'].sort());
  });

  it('crea módulos separados cuando app_module.id es distinto', () => {
    const membership: Membership = {
      id: 2,
      active: true,
      tenant: baseTenant,
      roles: [
        {
          id: 20,
          name: 'VehiclesRole',
          key: 'vehicles_role',
          tenant_permissions: [],
          permissions: [
            {
              id: 200,
              subject_class: 'Vehicle',
              action: 'read',
              app_module: {
                id: 1,
                name: 'Vehicles',
                description: null,
                active: true,
              },
            },
          ],
        },
        {
          id: 21,
          name: 'RoutesRole',
          key: 'routes_role',
          tenant_permissions: [],
          permissions: [
            {
              id: 201,
              subject_class: 'Route',
              action: 'read',
              app_module: {
                id: 2,
                name: 'Routes',
                description: 'Routes module',
                active: false,
              },
            },
          ],
        },
      ],
    };

    const result = buildEffectiveModulesFromMembership(membership);

    expect(result).toHaveLength(2);

    const vehiclesMod = result.find((m) => m.appModuleId === 1)!;
    const routesMod = result.find((m) => m.appModuleId === 2)!;

    expect(vehiclesMod.appModuleName).toBe('Vehicles');
    expect(vehiclesMod.actionsBySubject['Vehicle']).toEqual(['read']);

    expect(routesMod.appModuleName).toBe('Routes');
    expect(routesMod.appModuleDescription).toBe('Routes module');
    expect(routesMod.appModuleActive).toBe(false);
    expect(routesMod.actionsBySubject['Route']).toEqual(['read']);
  });

  it('ignora permisos que no tienen app_module (defensa extra)', () => {
    const membership: Membership = {
      id: 3,
      active: true,
      tenant: baseTenant,
      roles: [
        {
          id: 30,
          name: 'MixedRole',
          key: 'mixed',
          tenant_permissions: [],
          permissions: [
            {
              id: 300,
              subject_class: 'Vehicle',
              action: 'read',
              // @ts-expect-error app_module is forced to null to test the defensive branch
              app_module: null
            },
            {
              id: 301,
              subject_class: 'Vehicle',
              action: 'read',
              app_module: {
                id: 1,
                name: 'Vehicles',
                description: null,
                active: true,
              },
            },
          ],
        },
      ],
    };

    const result = buildEffectiveModulesFromMembership(membership);

    expect(result).toHaveLength(1);
    const mod = result[0];

    expect(mod.appModuleId).toBe(1);
    expect(mod.actionsBySubject['Vehicle']).toEqual(['read']);
  });
});
