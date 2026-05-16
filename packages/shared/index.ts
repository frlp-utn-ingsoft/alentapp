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
  start_date: string; // ISO Date String
  end_date: string; // ISO Date String
  is_total_suspension: boolean;
  deleted_at: string | null; // ISO Date String or null
  member_id: string; // UUID
}

export interface CreateDisciplineRequest {
  reason: string;
  start_date: string; // ISO Date String
  end_date: string; // ISO Date String
  is_total_suspension: boolean;
  member_id: string; // UUID
}