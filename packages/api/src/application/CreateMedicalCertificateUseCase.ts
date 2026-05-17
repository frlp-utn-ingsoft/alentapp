import { MemberRepository } from '../domain/MemberRepository.js';
import { MedicalCertificateRepository } from '../domain/MedicalCertificateRepository.js';
import { CreateMedicalCertificateRequest, MedicalCertificateResponseDTO } from '@alentapp/shared';

export class CreateMedicalCertificateUseCase {
    constructor(
        private readonly medicalCertificateRepository: MedicalCertificateRepository,
        private readonly memberRepository: MemberRepository
    ) {}

    async execute(data: CreateMedicalCertificateRequest): Promise<MedicalCertificateResponseDTO> {
        const issueDate = new Date(data.issue_date);
        const expiryDate = new Date(data.expiry_date);

        if (expiryDate <= issueDate) {
            throw new Error('La fecha de vencimiento debe ser posterior a la fecha de emisión');
        }

        const member = await this.memberRepository.findById(data.member_id);
        if (!member) {
            throw new Error('El socio indicado no existe');
        }

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
