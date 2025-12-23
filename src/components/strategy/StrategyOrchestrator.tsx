'use client';

import * as React from 'react';
import { lazy, useMemo } from 'react';
import {
  moduleStrategyRegistry,
  type ModuleKey,
  type ModuleStrategyKey,
  type StrategyComponent,
  type StrategyComponentLoader,
} from '@/config/moduleStrategies';

type Props<M extends ModuleKey> = {
  module: M;
  strategy: ModuleStrategyKey<M>;
};

// Build a lazy registry at module-eval time to avoid creating components during render.
const lazyStrategyRegistry: Partial<
  Record<ModuleKey, Record<string, React.LazyExoticComponent<StrategyComponent>>>
> = {};

(Object.keys(moduleStrategyRegistry) as ModuleKey[]).forEach((moduleKey) => {
  const moduleConfig = moduleStrategyRegistry[moduleKey];
  const strategies: Record<string, React.LazyExoticComponent<StrategyComponent>> = {};

  Object.keys(moduleConfig.strategies).forEach((strategyKey) => {
    const def = moduleConfig.strategies[strategyKey as keyof typeof moduleConfig.strategies];
    strategies[strategyKey] = lazy(def.loader as StrategyComponentLoader);
  });

  lazyStrategyRegistry[moduleKey] = strategies;
});

function selectStrategy<M extends ModuleKey>(
  moduleKey: M,
  strategyKey: ModuleStrategyKey<M>,
): React.LazyExoticComponent<StrategyComponent> {
  const moduleConfig = moduleStrategyRegistry[moduleKey];

  if (!moduleConfig) {
    throw new Error(`Strategy orchestrator: module "${moduleKey}" is not registered.`);
  }

  const strategies = lazyStrategyRegistry[moduleKey];
  if (!strategies) {
    throw new Error(`Strategy orchestrator: no strategies registered for module "${moduleKey}".`);
  }

  const requestedStrategy = strategies[strategyKey as string];
  if (requestedStrategy) {
    return requestedStrategy;
  }

  const defaultKey = moduleConfig.defaultStrategy as string;
  const defaultStrategy = strategies?.[defaultKey];

  if (defaultStrategy) {
    return defaultStrategy;
  }

  throw new Error(
    `Strategy orchestrator: no strategy found for module "${moduleKey}" (requested "${String(strategyKey)}").`,
  );
}

export function StrategyOrchestrator<M extends ModuleKey>({
  module,
  strategy,
}: Props<M>) {
  const Impl = useMemo(() => selectStrategy(module, strategy), [module, strategy]);
  return React.createElement(Impl);
}
