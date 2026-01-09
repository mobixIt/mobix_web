import { 
  moduleStrategyRegistry, 
  type ModuleKey, 
  type ModuleActionKey,
  type StrategyKey 
} from '@/config/moduleStrategies';

type ResolveOptions = {
  preferred?: string;
};

interface RuntimeActionConfig {
  defaultStrategy: string;
  strategies: Record<string, unknown>; 
}

export async function resolveModuleStrategy<
  M extends ModuleKey, 
  A extends ModuleActionKey<M>
>(
  module: M,
  action: A,
  options?: ResolveOptions,
): Promise<StrategyKey<M, A>> {
  const moduleConfig = moduleStrategyRegistry[module];
  
  if (!moduleConfig) {
    throw new Error(`Strategy Error: Module "${module}" not found in registry.`);
  }

  const actions = moduleConfig.actions as Record<string, RuntimeActionConfig>;
  const actionConfig = actions[action as string];

  if (!actionConfig) {
    throw new Error(`Strategy Error: Action "${String(action)}" not defined for module "${module}".`);
  }

  if (options?.preferred) {
    if (!Object.prototype.hasOwnProperty.call(actionConfig.strategies, options.preferred)) {
      throw new Error(
        `Strategy Critical: Backend requested strategy "${options.preferred}"`
        + ` for ${module}/${String(action)}, but it is not implemented in frontend registry.`
      );
    }

    return options.preferred as StrategyKey<M, A>;
  }

  return actionConfig.defaultStrategy as StrategyKey<M, A>;
}