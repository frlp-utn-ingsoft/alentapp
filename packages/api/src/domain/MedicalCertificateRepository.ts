import {
  CreateMedicalCertificateRequest,
  MedicalCertificateDTO,
} from '@alentapp/shared';

export interface MedicalCertificateRepository {
  findAll(): Promise<MedicalCertificateDTO[]>;

  findById(id: string): Promise<MedicalCertificateDTO | null>;

  create(certificate: CreateMedicalCertificateRequest & {is_validated: boolean;}): Promise<MedicalCertificateDTO>;

  createReplacingActive(
    certificate: CreateMedicalCertificateRequest & {
      is_validated: boolean;
    },
  ): Promise<MedicalCertificateDTO>;
  
  findActiveByMemberId(member_id: string): Promise<MedicalCertificateDTO | null>;

  invalidate(id: string): Promise<void>;

  delete(id: string): Promise<void>;
}

  