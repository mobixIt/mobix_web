'use client';

import { useMemo } from 'react';
import {
  selectDefaultStrategyForModule,
  selectIsModuleActive,
  selectPermissionsReady,
} from '@/store/slices/permissionsSlice';
import { useAppSelector } from '@/store/hooks';

import {
  moduleStrategyRegistry,
  type ModuleKey,
  type ModuleActionKey,
  type StrategyKey,
} from '@/config/moduleStrategies';

type Result<M extends ModuleKey, A extends ModuleActionKey<M>> =
  | { status: 'loading'; strategy: null }
  | { status: 'inactive'; strategy: null }
  | { status: 'ready'; strategy: StrategyKey<M, A> }
  | { status: 'error'; strategy: null; error: string };

function normalizeKey(value: unknown): string {
  return String(value ?? '').trim();
}

function getActionConfig<M extends ModuleKey, A extends ModuleActionKey<M>>(
  module: M,
  action: A,
) {
  const actions = moduleStrategyRegistry[module].actions;
  type ActionKey = Extract<keyof typeof actions, A>;
  return actions[action as ActionKey];
}

export function useResolvedModuleStrategy<
  M extends ModuleKey,
  A extends ModuleActionKey<M>
>(module: M, action: A): Result<M, A> {
  const permissionsReady = useAppSelector(selectPermissionsReady);
  const isActive = useAppSelector(selectIsModuleActive(module));
  const tenantDefault = useAppSelector(selectDefaultStrategyForModule(module));

  return useMemo(() => {
    if (!permissionsReady) return { status: 'loading', strategy: null } as const;
    if (!isActive) return { status: 'inactive', strategy: null } as const;

    const actionConfig = getActionConfig(module, action);
    const strategies = actionConfig.strategies;

    const backendKey = normalizeKey(tenantDefault);
    const candidateRaw = backendKey || 'base';

    if (!(candidateRaw in strategies)) {
      const available = Object.keys(strategies).sort().join(', ') || '(none)';
      return {
        status: 'error',
        strategy: null,
        error:
          `Strategy "${candidateRaw}" not implemented for ${String(module)}/${String(action)}.` +
          ` Backend defaultStrategyKey="${backendKey || 'null'}".` +
          ` Available strategies: ${available}.`,
      } as const;
    }

    return {
      status: 'ready',
      strategy: candidateRaw as StrategyKey<M, A>,
    } as const;
  }, [permissionsReady, isActive, module, action, tenantDefault]);
}
