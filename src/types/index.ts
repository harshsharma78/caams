export type UserRole = 'admin' | 'viewer';
export type OrganizationSize = 'startup' | 'sme' | 'enterprise';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface OrganizationFormValues {
  name: string;
  industry: string;
  size: OrganizationSize;
  sector: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  logoUrl: string;
}

export interface OrganizationListItem extends OrganizationFormValues {
  id: string;
  createdAt: string;
  assessmentCount?: number;
}
