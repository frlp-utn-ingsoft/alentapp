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
export interface SportResponse {
  id: string; // UUID
  name: string;
  description: string;
  max_capacity: number;
  additional_price: number;
  requires_medical_certificate: boolean;
}

export interface CreateSportRequest {
  name: string;
  description: string;
  max_capacity: number;
  additional_price: number;
  requires_medical_certificate: boolean;
}

export interface UpdateSportRequest {
  description?: string;
  max_capacity?: number;
  additional_price?: number;
  requires_medical_certificate?: boolean;
}

// ==========================
// = Payments
// ==========================
export * from './payment';

// ==========================
// = MedicalCertificate
// ==========================

//datos que el front envía al back para crear un certificado medico
export interface CreateMedicalCertificateRequest {
  memberId: string
  expiryDate: string
  doctorLicense: string
}

//(Objeto de Transferencia de Datos) enviada de vuelta al front como respuesta
export interface MedicalCertificateDTO {
  id: string
  issueDate: string
  expiryDate: string
  doctorLicense: string
  isValidated: boolean
  deletedAt: string | null

  memberId: string
}
