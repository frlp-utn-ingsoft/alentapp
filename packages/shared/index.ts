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

// ==========================================
// Equipment Loan
// ==========================================
export type LoanStatus = 'Loaned' | 'Returned' | 'Damaged';

export interface LoanDTO {
  id: string; // UUID
  member_id: string;
  item_name: string;
  loan_date: string; // ISO Date String
  due_date: string; // ISO Date String
  status: LoanStatus;
}

export interface CreateLoanRequest {
  member_id: string;
  item_name: string;
  due_date: string; // ISO Date String
}

export interface GetLoansQuery {
  status?: 'Loaned' | 'Returned' | 'Damaged';
  search?: string;
}

export interface LoanWithMemberDTO extends LoanDTO {
  member: {
    name: string;
  };
}

export interface UpdateLoanStatusRequest {
  status: 'Returned' | 'Damaged';
}

// ==========================================
// Medical Certificate
// ==========================================
export type MedicalCertificateStatus = 'Active' | 'Inactive';

export interface MedicalCertificateDTO {
  id: string; // UUID
  member_id: string;
  issue_date: string; // ISO Date String
  expiration_date?: string; // ISO Date String
  status: MedicalCertificateStatus;
  created_at: string;
  updated_at: string;
  invalidated_at?: string;
}

export interface CreateMedicalCertificateRequest {
  member_id: string;
  issue_date: string; // ISO Date String
  expiration_date?: string; // ISO Date String
}
