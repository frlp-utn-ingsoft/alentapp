import { CreateSportRequest, SportResponse } from '@alentapp/shared';
import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';

export class CreateSportUseCase {
  constructor(
    private readonly sportRepo: SportRepository,
    private readonly sportValidator: SportValidator,
  ) {}

  async execute(data: CreateSportRequest): Promise<SportResponse> {
    this.sportValidator.validateNameIsRequired(data.name);
    this.sportValidator.validateMaxCapacity(data.max_capacity);
    await this.sportValidator.validateNameIsUnique(data.name);

    return this.sportRepo.create({
      ...data,
      name: data.name.trim(),
      description: data.description.trim(),
    });
  }
}
