import { MedicalCertificateRepository } from '../../domain/MedicalCertificateRepository.js';

export class DeleteMedicalCertificateUseCase {
    constructor(
        private readonly medicalCertificateRepository: MedicalCertificateRepository
    ) {}

    async execute(id: string): Promise<void> {
        const certificate = await this.medicalCertificateRepository.findById(id);

        if (!certificate) {
            throw new Error('El certificado indicado no se encuentra');
        }

        await this.medicalCertificateRepository.delete(id);
    }
}