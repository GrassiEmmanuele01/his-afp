export type RoleCode = 'DOC' | 'INF' | 'AMM';

export interface RoleOption {
  code: RoleCode;
  desc: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  { code: 'DOC', desc: 'Medico' },
  { code: 'INF', desc: 'Infermiere' },
  { code: 'AMM', desc: 'Amministrativo' },
];

export interface Staff {
  id: number;
  username: string;
  role: RoleCode;
  isActive: boolean;
}

export interface CreateStaffPayload {
  username: string;
  password: string;
  role: RoleCode;
}

export interface CreateStaffResponse {
  id: number;
  username: string;
  role: RoleCode;
}

export interface UsernameAvailability {
  available: boolean;
}