import type { ComponentType } from 'react';

export type StrategyProps = Record<string, unknown>;
export type StrategyComponent = ComponentType<StrategyProps>;
export type StrategyComponentLoader = () => Promise<{ default: StrategyComponent }>;

export type StrategyDefinition = {
  loader: StrategyComponentLoader;
};

export type ActionConfig = {
  defaultStrategy: string;
  strategies: Record<string, StrategyDefinition>;
};

export type ModuleConfig = {
  actions: Record<string, ActionConfig>;
};

const dummyLoader: StrategyComponentLoader = () =>
  Promise.resolve({ default: () => null });

export const moduleStrategyRegistry = {
  vehicles: {
    actions: {
      index: {
        defaultStrategy: 'base',
        strategies: {
          base: {
            loader: () =>
              import('@/components/vehicles/actions/index/strategies/base/BaseVehiclesStrategy'),
          },
        },
      },
      create: {
        defaultStrategy: 'wizard',
        strategies: {
          wizard: { loader: dummyLoader },
          simple: { loader: dummyLoader },
        },
      },
    },
  },
} as const satisfies Record<string, ModuleConfig>;

export type StrategyRegistry = typeof moduleStrategyRegistry;

export type ModuleKey = keyof StrategyRegistry;

export type ModuleActionKey<M extends ModuleKey> =
  keyof StrategyRegistry[M]['actions'];

type StrategiesOf<
  M extends ModuleKey,
  A extends ModuleActionKey<M>
> = StrategyRegistry[M]['actions'][A] extends { strategies: infer S } ? S : never;

export type StrategyKey<
  M extends ModuleKey,
  A extends ModuleActionKey<M>
> = keyof (StrategiesOf<M, A>);