'use client';

import * as React from 'react';
import { lazy, useMemo } from 'react';
import {
  moduleStrategyRegistry,
  type ModuleKey,
  type ModuleActionKey,
  type StrategyKey,
  type StrategyComponentLoader,
  type StrategyComponent
} from '@/config/moduleStrategies';

type AdditionalProps = Record<string, unknown>;

type Props<M extends ModuleKey, A extends ModuleActionKey<M>> = {
  module: M;
  action: A;
  strategy: StrategyKey<M, A>;
} & AdditionalProps;

interface RuntimeStrategyDef {
  loader: StrategyComponentLoader;
}

interface RuntimeActionConfig {
  strategies: Record<string, RuntimeStrategyDef>;
}

interface RuntimeModuleConfig {
  actions: Record<string, RuntimeActionConfig>;
}

const componentCache = new Map<string, React.LazyExoticComponent<StrategyComponent>>();

function getLazyComponent<M extends ModuleKey, A extends ModuleActionKey<M>>(
  module: M,
  action: A,
  strategy: StrategyKey<M, A>
): React.LazyExoticComponent<StrategyComponent> {
  const cacheKey = `${module}:${String(action)}:${String(strategy)}`;

  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!;
  }

  const moduleConfig = moduleStrategyRegistry[module];
  
  const moduleRuntime = moduleConfig as unknown as RuntimeModuleConfig;
  const actionConfig = moduleRuntime.actions[action as string];
  
  if (!actionConfig) {
    throw new Error(`Orchestrator: Action "${String(action)}" not found inside module "${module}".`);
  }

  const strategyDef = actionConfig.strategies[strategy as string];

  if (!strategyDef) {
    throw new Error(`Orchestrator: Strategy "${String(strategy)}" definition not found.`);
  }

  const LazyComponent = lazy(strategyDef.loader);
  componentCache.set(cacheKey, LazyComponent);

  return LazyComponent;
}

export function StrategyOrchestrator<M extends ModuleKey, A extends ModuleActionKey<M>>({
  module,
  action,
  strategy,
  ...restProps
}: Props<M, A>) {
  
  const Component = useMemo(() => {
    return getLazyComponent(module, action, strategy);
  }, [module, action, strategy]);

  return React.createElement(Component, restProps);
}
