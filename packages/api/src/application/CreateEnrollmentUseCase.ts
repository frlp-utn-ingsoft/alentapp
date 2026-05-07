import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';
import { EnrollmentValidator } from '../domain/services/EnrollmentValidator.js';
import { EnrollmentDTO, CreateEnrollmentRequest } from '@alentapp/shared';

export class CreateEnrollmentUseCase {
    constructor(
        private readonly enrollmentRepo: EnrollmentRepository,
        private readonly enrollmentValidator: EnrollmentValidator,
    ) {}

    async execute(data: CreateEnrollmentRequest): Promise<EnrollmentDTO> {
        // 1. Validar que el socio existe
        await this.enrollmentValidator.validateMemberExists(data.member_id);

        // 2. Validar que el deporte existe y está activo
        await this.enrollmentValidator.validateSportExists(data.sport_id);

        // 3. Validar que el socio no esté ya inscripto en este deporte
        await this.enrollmentValidator.validateNotAlreadyEnrolled(data.member_id, data.sport_id);

        // 4. Validar que el deporte tenga cupo disponible
        await this.enrollmentValidator.validateCapacity(data.sport_id);

        // 5. Persistir
        return this.enrollmentRepo.create({
            member_id: data.member_id,
            sport_id: data.sport_id,
        });
    }
}
