import { MedicalCertificateResponseDTO, MedicalCertificateListItem } from '@alentapp/shared';

export interface MedicalCertificateRepository {
  findAll(): Promise<MedicalCertificateListItem[]>;
  save(certificate: Omit<MedicalCertificateResponseDTO, 'id' | 'deleted_at'>): Promise<MedicalCertificateResponseDTO>;
}
