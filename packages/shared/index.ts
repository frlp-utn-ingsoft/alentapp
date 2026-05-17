// ==========================================
// Member
// ==========================================
export type MemberCategory = 'Pleno' | 'Cadete' | 'Honorario';
export type MemberStatus = 'Activo' | 'Moroso' | 'Suspendido';

export interface MemberDTO {
  id: string; // UUID
  dni: string;
  name: string;
  email: string;
  birthdate: string; // ISO Date String (YYYY-MM-DD)
  category: MemberCategory;
  status: MemberStatus;
  created_at: string; // ISO Date String
}

export interface CreateMemberRequest {
  dni: string;
  name: string;
  email: string;
  birthdate: string; // ISO Date String (YYYY-MM-DD)
  category: MemberCategory;
}

export interface UpdateMemberRequest {
  dni?: string;
  name?: string;
  email?: string;
  birthdate?: string; // ISO Date String (YYYY-MM-DD)
  category?: MemberCategory;
  status?: MemberStatus;
}

// ==========================================
// Locker
// ==========================================

export type LockerLocation = 'MALE' | 'FEMALE' | 'CHILDREN';
export type LockerStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface LockerDTO {
  id: string;
  number: number;
  location: LockerLocation;
  status: LockerStatus;
  member_id: string | null;
  contract_end_date: string | null; // ISO Date String (YYYY-MM-DD) or null
}

export interface CreateLockerRequest {
  number: number;
  location: LockerLocation;
}