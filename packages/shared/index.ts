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
// Payment
// ==========================================

export type PaymentStatus = 'Pendiente' | 'Pagado' | 'Vencido' | 'Cancelado';

export interface PaymentDTO {
   id: string; //uuid
   member_id: string; //FK uuid
   amount: number;
   month: number;
   year: number;
   due_date: string; // ISO Date String (YYYY-MM-DD)
   payment_date: string | null; // ISO Date String (YYYY-MM-DD)
   status: PaymentStatus;
   member?: {
    name: string;
    dni: string;};
}

export interface CreatePaymentRequest {
  member_id: string;
  amount: number;
  month: number;
  year: number;
  due_date: string; // ISO Date String (YYYY-MM-DD)
  status?: PaymentStatus; // Opcional, por defecto 'Pendiente'
}

// Sport
// ==========================================
export interface SportDTO {
  id: string;
  name: string
  description?: string;
  max_capacity: number;
  additional_price: number;
  requires_medical_certificate: boolean;
}

export interface CreateSportRequest {
  name: string;
  description?: string;
  max_capacity: number;
  additional_price: number;
  requires_medical_certificate: boolean;
}
