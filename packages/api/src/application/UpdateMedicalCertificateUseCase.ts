import { MedicalCertificateRepository } from '../domain/MedicalCertificateRepository.js';
import { MedicalCertificateValidator } from '../domain/services/MedicalCertificateValidator.js';
import { MedicalCertificateResponseDTO, UpdateMedicalCertificateRequest } from '@alentapp/shared';

export class UpdateMedicalCertificateUseCase {
    constructor(
        private readonly medicalCertificateRepository: MedicalCertificateRepository,
        private readonly medicalCertificateValidator: MedicalCertificateValidator,
    ) {}

    async execute(id: string, data: UpdateMedicalCertificateRequest): Promise<MedicalCertificateResponseDTO> {
        this.medicalCertificateValidator.validateHasUpdateFields(data);

        const cert = await this.medicalCertificateRepository.findById(id);

        if (!cert) {
            throw new Error('El certificado médico no existe');
        }

        if (cert.deleted_at !== null) {
            throw new Error('No se puede modificar un certificado dado de baja');
        }

        if (cert.status === 'historical') {
            throw new Error('No se puede modificar un certificado histórico');
        }

        const issueDate = data.issue_date ?? cert.issue_date;
        const expiryDate = data.expiry_date ?? cert.expiry_date;

        if (data.issue_date !== undefined || data.expiry_date !== undefined) {
            this.medicalCertificateValidator.validateDateFormat(issueDate);
            this.medicalCertificateValidator.validateDateFormat(expiryDate);
            this.medicalCertificateValidator.validateExpiryAfterIssue(issueDate, expiryDate);
        }

        if (data.status === 'validated') {
            this.medicalCertificateValidator.validateStatusTransition(cert.status, 'validated');
            this.medicalCertificateValidator.validateExpiryIsFuture(expiryDate);
            return this.medicalCertificateRepository.updateStatusToValidated(id, cert.member_id);
        }

        if (data.status !== undefined && data.status !== cert.status) {
            this.medicalCertificateValidator.validateStatusTransition(cert.status, data.status);
        }

        return this.medicalCertificateRepository.update(id, data);
    }
}
