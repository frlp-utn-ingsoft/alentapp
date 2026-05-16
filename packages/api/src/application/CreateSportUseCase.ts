import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';
import { CreateSportRequest, SportDTO } from '@alentapp/shared';

export class CreateSportUseCase {
    constructor(
        private readonly sportRepository: SportRepository,
        private readonly sportValidator: SportValidator,
    ) {}

    async execute(data: CreateSportRequest): Promise<SportDTO> {
        // Valida campos obligatorios del deporte.
        this.sportValidator.validateRequiredFields(data);

        // Valida reglas numéricas reutilizables para alta y futura actualización.
        this.sportValidator.validateMaxCapacity(data.max_capacity);
        this.sportValidator.validateAdditionalPrice(data.additional_price);

        // no puede existir otro deporte activo con el mismo nombre.
        const existingSport = await this.sportRepository.findActiveByName(data.name);

        if (existingSport) {
            throw new Error('Ya existe un deporte activo con ese nombre');
        }

        // La creación se delega al repositorio.
        return this.sportRepository.create(data);
    }
}