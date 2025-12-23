import type { ComponentType } from 'react';

export type StrategyComponent = ComponentType<Record<string, unknown>>;

export type StrategyComponentLoader = () => Promise<{ default: StrategyComponent }>;

export type StrategyDefinition = {
  loader: StrategyComponentLoader;
  features?: Record<string, boolean>;
  uiConfig?: Record<string, unknown>;
};

export type ModuleStrategyConfig<Strategy extends string> = {
  defaultStrategy: Strategy;
  strategies: Record<Strategy, StrategyDefinition>;
};

export type StrategyRegistry = Record<string, ModuleStrategyConfig<string>>;

export const moduleStrategyRegistry = {
  vehicles: {
    defaultStrategy: 'base',
    strategies: {
      base: {
        loader: () => import('@/components/vehicles'),
      },
    },
  },
} satisfies StrategyRegistry;

export type ModuleStrategyRegistry = typeof moduleStrategyRegistry;
export type ModuleKey = keyof ModuleStrategyRegistry;
export type ModuleStrategyKey<M extends ModuleKey> =
  keyof ModuleStrategyRegistry[M]['strategies'];
export type ModuleStrategyDefinition<M extends ModuleKey> =
  ModuleStrategyRegistry[M]['strategies'][ModuleStrategyKey<M>];
