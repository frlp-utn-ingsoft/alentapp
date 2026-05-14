import { SportRepository } from '../domain/SportRepository.js';
import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';

export class DeleteSportUseCase {
  constructor(
    private readonly sportRepo: SportRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existingSport = await this.sportRepo.findById(id);
    if (!existingSport) {
      throw new Error('El deporte no existe');
    }

    const hasEnrollments = await this.enrollmentRepo.existsBySportId(id);
    if (hasEnrollments) {
      throw new Error('No se puede eliminar un deporte con inscripciones');
    }

    await this.sportRepo.delete(id);
  }
}
