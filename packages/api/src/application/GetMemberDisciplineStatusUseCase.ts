import { MemberDisciplineStatusResponse } from '@alentapp/shared';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';

export class GetMemberDisciplineStatusUseCase {
    constructor(
        private readonly disciplineRepo: DisciplineRepository,
        private readonly memberRepo: MemberRepository,
    ) {}

    async execute(memberId: string): Promise<MemberDisciplineStatusResponse> {
        const existingMember = await this.memberRepo.findById(memberId);
        if (!existingMember) {
            throw new Error('El socio especificado no existe');
        }

        const activeTotalSuspension = await this.disciplineRepo.findActiveTotalSuspensionByMemberId(
            memberId,
            new Date(),
        );

        return {
            memberId,
            isSuspended: Boolean(activeTotalSuspension),
            ...(activeTotalSuspension && { activeTotalSuspension }),
        };
    }
}
