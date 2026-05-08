import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';
import { EnrollmentDTO, UpdateEnrollmentRequest } from '@alentapp/shared';

export class UpdateEnrollmentUseCase {
    constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

    async execute(id: string, data: UpdateEnrollmentRequest): Promise<EnrollmentDTO> {
        // 1. Verificar existencia
        const existing = await this.enrollmentRepo.findById(id);
        if (!existing) {
            throw new Error('No existe una inscripción con ese ID');
        }

        // 2. Actualizar
        return this.enrollmentRepo.update(id, data);
    }
}
