import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';

export class DeleteEnrollmentUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(id: string): Promise<void> {
    const existingEnrollment = await this.enrollmentRepo.findById(id);
    if (!existingEnrollment) {
      throw new Error('La inscripción no existe');
    }

    await this.enrollmentRepo.delete(id);
  }
}
