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
// Sport
// ==========================================
export interface SportDTO {
  id: string; // UUID
  name: string;
  description: string | null;
  max_capacity: number;
  additional_price: number;
  requires_medical_certificate: boolean;
  deleted_at: string | null; // ISO Date String or null
}

export interface CreateSportRequest {
  name: string;
  description?: string | null;
  max_capacity: number;
  additional_price?: number;
  requires_medical_certificate?: boolean;
}

export interface UpdateSportRequest {
  description?: string | null;
  max_capacity?: number;
  additional_price?: number;
  requires_medical_certificate?: boolean;
}

// ==========================================
// Enrollment
// ==========================================
export interface EnrollmentDTO {
  id: string; // UUID
  member_id: string; // UUID
  sport_id: string; // UUID
  enrollment_date: string; // ISO Date String
  is_active: boolean;
  member_name?: string; // Populated in joins
  sport_name?: string; // Populated in joins
}

export interface CreateEnrollmentRequest {
  member_id: string; // UUID
  sport_id: string; // UUID
}

export interface UpdateEnrollmentRequest {
  is_active?: boolean;
}

// ==========================================
// Payment
// ==========================================
export type PaymentStatus = 'Pending' | 'Paid' | 'Canceled';

export interface PaymentDTO {
  id: string;
  amount: number;
  month: number;
  year: number;
  status: PaymentStatus;
  due_date: string; // ISO Date String (YYYY-MM-DD)
  payment_date: string | null;
  member_id: string;
  member_name?: string; // Opcional para joins
}

export interface CreatePaymentRequest {
  amount: number;
  month: number;
  year: number;
  due_date: string; // ISO Date String (YYYY-MM-DD)
  member_id: string;
}

export interface UpdatePaymentRequest {
  status: 'Paid';
  payment_date: string; // ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
}
