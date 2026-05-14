import { SportResponse, UpdateSportRequest } from '@alentapp/shared';
import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';

export class UpdateSportUseCase {
  constructor(
    private readonly sportRepo: SportRepository,
    private readonly sportValidator: SportValidator,
  ) {}

  async execute(id: string, data: UpdateSportRequest & Record<string, unknown>): Promise<SportResponse> {
    const existingSport = await this.sportRepo.findById(id);
    if (!existingSport) {
      throw new Error('El deporte no existe');
    }

    this.sportValidator.validateNameIsImmutable(data);

    if (data.max_capacity !== undefined) {
      this.sportValidator.validateMaxCapacity(data.max_capacity);
    }

    return this.sportRepo.update(id, data);
  }
}
