export interface MedicalCertificateDTO {
  id: string;
  issue_date: Date;
  expiry_date: Date;
  doctor_license: string;
  is_validated: boolean;
  member_id: string;
}

export interface CreateMedicalCertificateRequest {
  member_id: string;
  issue_date: Date;
  expiry_date: Date;
  doctor_license: string;
}
