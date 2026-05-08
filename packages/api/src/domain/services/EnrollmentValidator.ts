import { EnrollmentRepository } from '../EnrollmentRepository.js';
import { SportRepository } from '../SportRepository.js';
import { MemberRepository } from '../MemberRepository.js';

export class EnrollmentValidator {
    constructor(
        private readonly enrollmentRepo: EnrollmentRepository,
        private readonly memberRepo: MemberRepository,
        private readonly sportRepo: SportRepository,
    ) {}

    async validateMemberExists(memberId: string): Promise<void> {
        const member = await this.memberRepo.findById(memberId);
        if (!member) {
            throw new Error('No existe un socio con ese ID');
        }
    }

    async validateSportExists(sportId: string): Promise<void> {
        const sport = await this.sportRepo.findActiveById(sportId);
        if (!sport) {
            throw new Error('No existe un deporte con ese ID');
        }
    }

    async validateNotAlreadyEnrolled(memberId: string, sportId: string): Promise<void> {
        const existing = await this.enrollmentRepo.findByMemberAndSport(memberId, sportId);
        if (existing) {
            throw new Error('El socio ya está inscripto en este deporte');
        }
    }

    async validateCapacity(sportId: string): Promise<void> {
        const sport = await this.sportRepo.findActiveById(sportId);
        if (!sport) {
            throw new Error('No existe un deporte con ese ID');
        }

        const activeEnrollments = await this.enrollmentRepo.countActiveBySport(sportId);
        if (activeEnrollments >= sport.max_capacity) {
            throw new Error(`El deporte "${sport.name}" ya alcanzó su cupo máximo de ${sport.max_capacity} inscriptos`);
        }
    }
}
