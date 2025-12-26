export interface TenantPermission {
  id: number;
  subject_class: string;
  action: string;
  app_module: { id: number; name: string; description: string; active: boolean };
}

export interface Membership {
  id: number | string;
  active: boolean;
  tenant: { id: number | string; slug: string; name?: string };
  roles?: unknown[];
  tenant_permissions?: TenantPermission[];
  permissions?: unknown[];
}

export interface AuthMeResponse {
  data: {
    id: number | string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    memberships?: Membership[];
  };
}
