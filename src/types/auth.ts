export interface Tenant {
  id: number;
  slug: string;
}

export interface Membership {
  id: number;
  active: boolean;
  tenant: Tenant;
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