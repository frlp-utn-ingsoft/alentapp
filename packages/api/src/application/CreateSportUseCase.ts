import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';
import { CreateSportRequest, SportDTO } from '@alentapp/shared';

export class CreateSportUseCase {
    constructor(
        private readonly sportRepository: SportRepository,
        private readonly sportValidator: SportValidator,
    ) {}

    async execute(data: CreateSportRequest): Promise<SportDTO> {
        const normalizedData: CreateSportRequest = {
        ...data,
        name: data.name.trim(),
        description: data.description.trim(),
        };

        // Valida campos obligatorios del deporte.
        this.sportValidator.validateRequiredFields(normalizedData);
        // Valida reglas numéricas reutilizables para alta y futura actualización.
        this.sportValidator.validateMaxCapacity(normalizedData.max_capacity);
        this.sportValidator.validateAdditionalPrice(normalizedData.additional_price);

        // no puede existir otro deporte activo con el mismo nombre.
        const existingSport = await this.sportRepository.findActiveByName(normalizedData.name);

        if (existingSport) {
            throw new Error('Ya existe un deporte activo con ese nombre');
        }

        // La creación se delega al repositorio.
        return this.sportRepository.create(normalizedData);
    }
}