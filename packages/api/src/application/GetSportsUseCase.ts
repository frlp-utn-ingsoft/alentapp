import { SportRepository } from '../domain/SportRepository.js';
import { SportResponse } from '@alentapp/shared';

export class GetSportsUseCase {
  constructor(private readonly sportRepo: SportRepository) {}

  async execute(): Promise<SportResponse[]> {
    return this.sportRepo.findAll();
  }
}
