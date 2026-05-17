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


export type PaymentStatus = 'Pendiente' | 'Pagado' | 'Cancelado';

export interface PaymentDTO {
  id: string;
  member_id: string;
  amount: number;
  month: number;
  year: number;
  status: PaymentStatus;
  due_date: string;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
  canceled_at: string | null;
}

export interface CreatePaymentRequest {
  member_id: string;
  amount: number;
  month: number;
  year: number;
  due_date: string;
}

export interface UpdatePaymentRequest {
  amount?: number;
  due_date?: string;
}

export interface PaymentResponse {
  data: PaymentDTO;
}

export interface PaymentsResponse {
  data: PaymentDTO[];
}
