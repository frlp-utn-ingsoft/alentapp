import { DisciplineDTO } from '@alentapp/shared';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';

export class ListMemberDisciplinesUseCase {
    constructor(
        private readonly disciplineRepo: DisciplineRepository,
        private readonly memberRepo: MemberRepository,
    ) {}

    async execute(memberId: string): Promise<DisciplineDTO[]> {
        const existingMember = await this.memberRepo.findById(memberId);
        if (!existingMember) {
            throw new Error('El socio especificado no existe');
        }

        return this.disciplineRepo.findByMemberId(memberId);
    }
}
