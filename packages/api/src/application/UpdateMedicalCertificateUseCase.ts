import {
  UpdateMedicalCertificateRequest,
  MedicalCertificateDTO,
} from "@alentapp/shared"
import { MedicalCertificateRepository } from "../domain/MedicalCertificateRepository.js"
import { MedicalCertificateValidator } from "../domain/services/MedicalCertificateValidator.js"
export class UpdateMedicalCertificateUseCase {
  constructor(
    private readonly medicalCertificateRepository: MedicalCertificateRepository,
    private readonly medicalCertificateValidator: MedicalCertificateValidator,
  ) {}
  async execute(
    id: string,
    data: UpdateMedicalCertificateRequest
  ): Promise<MedicalCertificateDTO> {
    // 1. Validar existencia del certificado
    const certificate = await this.medicalCertificateRepository.findById(id)
    if (!certificate || certificate.deletedAt !== null) {
      throw new Error("Certificado no encontrado")
    }
    // 2. Validar fechas (solo si se envía expiryDate)
    this.medicalCertificateValidator.validateUpdate(
      data,
      new Date(certificate.issueDate)
    )
    // 3. Si se está activando este certificado, invalidar otros activos del socio
    if (data.isValidated === true) {
      await this.medicalCertificateRepository.invalidatePreviousCertificates(
        certificate.memberId
      )
    }
    // 4. Actualizar certificado
    return this.medicalCertificateRepository.update(id, data)
  }
}