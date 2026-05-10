import { CreateDisciplineRequest, DisciplineDTO } from '@alentapp/shared';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';

export class CreateDisciplineUseCase {
    constructor(
        private readonly disciplineRepo: DisciplineRepository,
        private readonly memberRepo: MemberRepository,
        private readonly disciplineValidator: DisciplineValidator,
    ) {}

    async execute(data: CreateDisciplineRequest): Promise<DisciplineDTO> {
        this.disciplineValidator.validateRequiredFields(data);
        this.disciplineValidator.validateReason(data.reason);
        this.disciplineValidator.validateDates(data.startDate, data.endDate);

        const existingMember = await this.memberRepo.findById(data.memberId);
        if (!existingMember) {
            throw new Error('El socio especificado no existe');
        }

        return this.disciplineRepo.create(data);
    }
}
