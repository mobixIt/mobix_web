export interface Client {
  id: number;
  name: string;
  short_name: string | null;
  country_code: string | null;
  logo_url: string | null;
}

/**
 * Strategies attached to a tenant module.
 * If strategies are present, backend guarantees (or should guarantee) one default strategy.
 */
export interface TenantModuleStrategy {
  id: number;
  default: boolean;
  strategy_id: number;
  name: string;
  key: string; // e.g. "base"
}

/**
 * Module enabled/disabled at tenant level + strategies.
 */
export interface TenantModule {
  id: number;
  active: boolean;
  name: string; // e.g. "Vehicles"
  key: string; // e.g. "vehicles"
  strategies: TenantModuleStrategy[];
}

export interface Tenant {
  id: number;
  slug: string;

  /**
   * Client can be null for legacy tenants or partial responses.
   */
  client: Client | null;

  /**
   * Modules configured for this tenant. New backend payload includes this.
   * Keep optional to avoid breaking older payloads/environments.
   */
  modules?: TenantModule[];
}

export interface AppModule {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
}

export interface TenantPermission {
  id: number;
  subject_class: string;
  action: string;
  allow_attributes: string[] | null;
  deny_attributes: string[] | null;

  /**
   * App module context for this permission.
   */
  app_module: AppModule;
}

export interface Permission {
  id: number;
  subject_class: string;
  action: string;

  /**
   * App module context for this permission.
   */
  app_module: AppModule;
}

export interface Role {
  id: number;
  name: string;
  key: string;
  tenant_permissions: TenantPermission[];
  permissions: Permission[];
}

export interface Membership {
  id: number;
  active: boolean;
  tenant: Tenant;
  roles: Role[];
}

export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}

export interface MeResponse extends Person {
  memberships: Membership[];
}

/**
 * Response used in the permissions slice.
 * NOTE: This matches your current slice usage: membership.memberships
 * If your API returns { data: MembershipResponse }, create a wrapper type separately.
 */
export type MembershipResponse = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  memberships: Membership[];
};

export interface DefaultTenant {
  id: number;
  slug: string;
}

export interface DefaultMembership {
  id: number;
  tenant: DefaultTenant;
}

export interface LoginSuccessPayload {
  expires_at: string;
  idle_timeout_minutes?: number;
  default_membership: DefaultMembership;
}
