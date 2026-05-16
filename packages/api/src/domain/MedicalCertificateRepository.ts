import {
  CreateMedicalCertificateRequest,
  MedicalCertificateDTO
} from "@alentapp/shared"

export interface MedicalCertificateRepository {

  create(
    data: CreateMedicalCertificateRequest
  ): Promise<MedicalCertificateDTO>

  invalidatePreviousCertificates(
    memberId: string
  ): Promise<void>
}