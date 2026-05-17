import { CreateSportRequest, SportDTO } from '@alentapp/shared';
import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';

export class CreateSportUseCase {
    constructor(
        private readonly sportRepository: SportRepository,
        private readonly sportValidator: SportValidator,
    ) {}

    async execute(data: CreateSportRequest): Promise<SportDTO> {
        this.sportValidator.validateMaxCapacity(data.max_capacity);
        await this.sportValidator.validateNameIsUnique(data.name);

        return this.sportRepository.create(data);
    }
}
