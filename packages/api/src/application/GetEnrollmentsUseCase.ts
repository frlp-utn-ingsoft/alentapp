import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';
import { EnrollmentDTO } from '@alentapp/shared';

export class GetEnrollmentsUseCase {
    constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

    async execute(): Promise<EnrollmentDTO[]> {
        return this.enrollmentRepo.findAll();
    }
}
