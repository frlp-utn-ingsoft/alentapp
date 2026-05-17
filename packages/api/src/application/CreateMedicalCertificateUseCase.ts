import { MedicalCertificateRepository } from '../domain/MedicalCertificateRepository.js';
import { MedicalCertificateValidator } from '../domain/services/MedicalCertificateValidator.js';
import { CreateMedicalCertificateRequest, MedicalCertificateResponseDTO } from '@alentapp/shared';

export class CreateMedicalCertificateUseCase {
    constructor(
        private readonly medicalCertificateRepository: MedicalCertificateRepository,
        private readonly medicalCertificateValidator: MedicalCertificateValidator
    ) {}

    async execute(data: CreateMedicalCertificateRequest): Promise<MedicalCertificateResponseDTO> {
        this.medicalCertificateValidator.validateDateFormat(data.issue_date);
        this.medicalCertificateValidator.validateDateFormat(data.expiry_date);
        this.medicalCertificateValidator.validateExpiryAfterIssue(data.issue_date, data.expiry_date);
        await this.medicalCertificateValidator.validateMemberExists(data.member_id);

        return this.medicalCertificateRepository.save({
            member_id: data.member_id,
            issue_date: data.issue_date,
            expiry_date: data.expiry_date,
            doctor_license: data.doctor_license,
            institution: data.institution,
            status: 'in_review',
        });
    }
}
