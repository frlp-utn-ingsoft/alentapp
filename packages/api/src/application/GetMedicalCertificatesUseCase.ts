import { MedicalCertificateRepository } from '../domain/MedicalCertificateRepository.js';
import { MedicalCertificateListItem } from '@alentapp/shared';

export class GetMedicalCertificatesUseCase {
    constructor(private readonly medicalCertificateRepository: MedicalCertificateRepository) {}

    async execute(): Promise<MedicalCertificateListItem[]> {
        return this.medicalCertificateRepository.findAll();
    }
}
