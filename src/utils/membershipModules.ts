import type { Membership, EffectiveModule } from '@/types/access-control';

export function buildEffectiveModulesFromMembership(
  membership: Membership,
): EffectiveModule[] {
  const byModuleId = new Map<number, EffectiveModule>();

  for (const role of membership.roles) {
    for (const perm of role.permissions) {
      const mod = perm.app_module;
      if (!mod) continue;

      if (!byModuleId.has(mod.id)) {
        byModuleId.set(mod.id, {
          appModuleId: mod.id,
          appModuleName: mod.name,
          appModuleDescription: mod.description,
          appModuleActive: mod.active,
          actionsBySubject: {},
        });
      }

      const target = byModuleId.get(mod.id)!;
      const subject = perm.subject_class;
      const action = perm.action;

      const currentActions = target.actionsBySubject[subject] ?? [];
      if (!currentActions.includes(action)) {
        target.actionsBySubject[subject] = [...currentActions, action];
      }
    }
  }

  return Array.from(byModuleId.values());
}
