// Tipos para las organizaciones
export interface Organization {
  id: string;
  clerk_org_id: string;
  name: string;
  plan: string;
  plan_status: string;
  trial_ends_at: Date | null;
  created_at: Date;
  updated_at: Date;
  users?: User[];
  properties?: Property[];
  leads?: Lead[];
  _count?: {
    users: number;
    properties: number;
    leads: number;
  };
}

export interface User {
  id: string;
  clerk_user_id: string;
  organization_id: string;
  role: string;
  email: string | null;
  name: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Property {
  id: string;
  organization_id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface Lead {
  id: string;
  organization_id: string;
  property_id: string | null;
  assigned_user_id: string | null;
  source: string;
  name: string;
  email: string | null;
  phone: string | null;
  budget: number | null;
  zone: string | null;
  timeframe: string | null;
  property_type: string | null;
  raw_payload: unknown;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// Request types
export interface CreateOrganizationRequest {
  name?: string;
  plan: string;
  clerkUserId?: string;
  clerkOrgId?: string;
}

export interface UpdateOrganizationRequest {
  organizationId: string;
  name?: string;
  plan?: string;
  planStatus?: string;
}

export interface UpdatePlanRequest {
  organizationId: string;
  plan: string;
  planStatus?: string;
}

export interface AddUserToOrganizationRequest {
  organizationId: string;
  clerkUserId: string;
}

// Response types
export interface CreateOrganizationResponse {
  id: string;
  name: string;
  plan: string;
  clerk_org_id: string;
  created_at: Date;
}

export interface ListOrganizationsResponse {
  organizations: Organization[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  error: string;
}

export interface CreatePropertyRequest {
  organizationId: string;
  title: string;
  type: string;
  price: number;
  location: string;
  status: string;
}

export interface CreatePropertyResponse {
  id: string;
  organization_id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface UpdatePropertyRequest {
  id: string;
  title?: string;
  type?: string;
  price?: number;
  location?: string;
  status?: string;
}

export type UpdatePropertyResponse = CreatePropertyResponse;

export interface DeletePropertyResponse {
  id: string;
  organization_id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
