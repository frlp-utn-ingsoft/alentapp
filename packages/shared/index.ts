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
// Discipline
// ==========================================
export interface DisciplineDTO {
  id: string; // UUID
  reason: string;
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  isTotalSuspension: boolean;
  memberId: string;
}

export type DisciplineResponse = DisciplineDTO;

export interface CreateDisciplineRequest {
  reason: string;
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  isTotalSuspension: boolean;
  memberId: string;
}

export interface UpdateDisciplineRequest {
  reason?: string;
  startDate?: string; // ISO Date String
  endDate?: string; // ISO Date String
  isTotalSuspension?: boolean;
}

export interface MemberDisciplineStatusResponse {
  memberId: string;
  isSuspended: boolean;
  activeTotalSuspension?: DisciplineResponse;
}
