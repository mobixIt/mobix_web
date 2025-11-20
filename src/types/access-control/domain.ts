export interface EffectiveModule {
  appModuleId: number;
  appModuleName: string;
  appModuleDescription: string | null;
  appModuleActive: boolean;
  actionsBySubject: Record<string, string[]>;
}
