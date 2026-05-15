import {
  CreateMedicalCertificateRequest,
  MedicalCertificateDTO,
} from '@alentapp/shared';

export interface MedicalCertificateRepository {
  findAll(): Promise<MedicalCertificateDTO[]>;

  create(certificate: CreateMedicalCertificateRequest & {is_validated: boolean;}): Promise<MedicalCertificateDTO>;

  createReplacingActive(
    certificate: CreateMedicalCertificateRequest & {
      is_validated: boolean;
    },
  ): Promise<MedicalCertificateDTO>;
  
  findActiveByMemberId(member_id: string): Promise<MedicalCertificateDTO | null>;

  invalidate(id: string): Promise<void>;
}

  