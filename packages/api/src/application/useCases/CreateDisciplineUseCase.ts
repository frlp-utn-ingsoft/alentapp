import { IDisciplineRepository } from '../ports/IDisciplineRepository.js';
import { DisciplineValidator } from '../../domain/services/DisciplineValidator.js';
import { DisciplineResponse, CreateDisciplineRequest } from '@alentapp/shared';

export class CreateDisciplineUseCase {
    constructor(
        private readonly disciplineRepository: IDisciplineRepository,
        private readonly disciplineValidator: DisciplineValidator,
    ) { }

    async execute(data: CreateDisciplineRequest): Promise<DisciplineResponse> {
        // 1. Validaciones de negocio
        this.disciplineValidator.validateMotivo(data.motivo);
        this.disciplineValidator.validateDates(data.fechaInicio, data.fechaFin);

        // 2. Persistencia
        const sancion = await this.disciplineRepository.create({
            motivo: data.motivo,
            fechaInicio: data.fechaInicio,
            fechaFin: data.fechaFin,
            esSuspensionTotal: data.esSuspensionTotal,
            miembro_id: data.miembro_id,
        });

        return sancion;
    }
}
