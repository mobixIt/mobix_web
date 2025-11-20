export interface Tenant {
  id: number;
  slug: string;
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
  app_module: AppModule;
}

export interface Permission {
  id: number;
  subject_class: string;
  action: string;
  app_module: AppModule;
}

export interface MeResponse extends Person {
  memberships: Membership[];
}

export type MembershipResponse = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  memberships: Membership[];
};
