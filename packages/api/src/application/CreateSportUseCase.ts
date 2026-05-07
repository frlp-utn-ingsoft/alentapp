import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';
import { SportDTO, CreateSportRequest } from '@alentapp/shared';

export class CreateSportUseCase {
    constructor(
        private readonly sportRepo: SportRepository,
        private readonly sportValidator: SportValidator
    ) {}

    async execute(data: CreateSportRequest): Promise<SportDTO> {
        // 1. Validaciones de negocio
        this.sportValidator.validateName(data.name);
        this.sportValidator.validateMaxCapacity(data.max_capacity);

        if (data.additional_price !== undefined) {
            this.sportValidator.validateAdditionalPrice(data.additional_price);
        }

        await this.sportValidator.validateNameIsUnique(data.name);

        // 2. Valores por defecto
        const sportData = {
            name: data.name.trim(),
            description: data.description ?? null,
            max_capacity: data.max_capacity,
            additional_price: data.additional_price ?? 0,
            requires_medical_certificate: data.requires_medical_certificate ?? false,
        };

        // 3. Persistir
        return this.sportRepo.create(sportData);
    }
}
