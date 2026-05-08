import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';

export class DeleteEnrollmentUseCase {
    constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

    async execute(id: string): Promise<void> {
        // 1. Verificar existencia
        const existing = await this.enrollmentRepo.findById(id);
        if (!existing) {
            throw new Error('No existe una inscripción con ese ID');
        }

        // 2. Eliminar
        await this.enrollmentRepo.delete(id);
    }
}
