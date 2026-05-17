import { EnrollmentDTO } from '@alentapp/shared';
import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';

export class GetEnrollmentsUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(): Promise<EnrollmentDTO[]> {
    return this.enrollmentRepo.findAll();
  }
}
