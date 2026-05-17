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
  birthdate?: string;
  category?: MemberCategory;
  status?: MemberStatus;
}

// ==========================================
// Medical Certificate
// ==========================================
export type MedicalCertificateStatus = 'in_review' | 'validated' | 'historical';

export interface MedicalCertificateResponseDTO {
  id: string;
  member_id: string;
  issue_date: string;
  expiry_date: string;
  doctor_license: string;
  institution: string;
  status: MedicalCertificateStatus;
  deleted_at: string | null;
}

export interface MedicalCertificateListItem extends MedicalCertificateResponseDTO {
  member_dni: string;
}

export interface CreateMedicalCertificateRequest {
  issue_date: string;
  expiry_date: string;
  doctor_license: string;
  institution: string;
  member_id: string;
}
