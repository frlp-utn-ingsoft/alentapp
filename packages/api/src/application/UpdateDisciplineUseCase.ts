import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';
import { DisciplineDTO, UpdateDisciplineRequest } from '@alentapp/shared';

export class UpdateDisciplineUseCase {
    constructor(
        private readonly disciplineRepository: DisciplineRepository,
        private readonly disciplineValidator: DisciplineValidator,
    ) {}

    async execute(id: string, data: UpdateDisciplineRequest): Promise<DisciplineDTO> {
        // 1. Validar existencia de la sanción
        const existingDiscipline = await this.disciplineRepository.findById(id);

        if (!existingDiscipline) {
            throw new Error('La sanción no existe');
        }

        // 2. Validar que la sanción no esté eliminada

        if (existingDiscipline.deleted_at !== null) {
            throw new Error('No se puede modificar una sanción eliminada');
        }

        // 3. Validaciones de negocio
        this.disciplineValidator.validateHasUpdateFields(data);
        this.disciplineValidator.validateMemberIdIsNotPresent(data);
        this.disciplineValidator.validateUpdateReason(data.reason);
        this.disciplineValidator.validateUpdateIsTotalSuspension(data.is_total_suspension);
        this.disciplineValidator.validateUpdateDateFormat(data.start_date);
        this.disciplineValidator.validateUpdateDateFormat(data.end_date);

        // 4. Validar fechas combinando valores actuales + nuevos
        const finalStartDate = data.start_date ?? existingDiscipline.start_date;
        const finalEndDate = data.end_date ?? existingDiscipline.end_date;

        this.disciplineValidator.validateEndDateAfterStartDate(
            finalStartDate, 
            finalEndDate
        );

        // 5. Persistencia a travez de la interfaz
        return this.disciplineRepository.update(id, data);
    }
}