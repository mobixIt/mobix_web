import { moduleStrategyRegistry, type ModuleKey, type ModuleStrategyKey } from '@/config/moduleStrategies';

type ResolveStrategyOptions<M extends ModuleKey> = {
  preferred?: ModuleStrategyKey<M>;
};

// Server-side resolver; plug tenant/flag logic here when available.
export async function resolveModuleStrategy<M extends ModuleKey>(
  module: M,
  options?: ResolveStrategyOptions<M>,
): Promise<ModuleStrategyKey<M>> {
  const moduleConfig = moduleStrategyRegistry[module];

  if (!moduleConfig) {
    throw new Error(`No strategy registry found for module "${module}".`);
  }

  if (options?.preferred && moduleConfig.strategies[options.preferred]) {
    return options.preferred;
  }

  return moduleConfig.defaultStrategy;
}
