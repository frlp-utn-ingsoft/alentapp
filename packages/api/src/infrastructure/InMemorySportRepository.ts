import { randomUUID } from 'node:crypto';
import { CreateSportRequest, SportResponse, UpdateSportRequest } from '@alentapp/shared';
import { SportRepository } from '../domain/SportRepository.js';

export class InMemorySportRepository implements SportRepository {
  private sports: SportResponse[] = [];

  async create(data: CreateSportRequest): Promise<SportResponse> {
    const sport: SportResponse = {
      id: randomUUID(),
      ...data,
    };
    this.sports.unshift(sport);
    return sport;
  }

  async findAll(): Promise<SportResponse[]> {
    return [...this.sports];
  }

  async findById(id: string): Promise<SportResponse | null> {
    return this.sports.find((sport) => sport.id === id) ?? null;
  }

  async findByName(name: string): Promise<SportResponse | null> {
    return this.sports.find((sport) => sport.name.toLowerCase() === name.toLowerCase()) ?? null;
  }

  async update(id: string, data: UpdateSportRequest): Promise<SportResponse> {
    const index = this.sports.findIndex((sport) => sport.id === id);
    if (index === -1) {
      throw new Error('El deporte no existe');
    }

    const updatedSport = {
      ...this.sports[index],
      ...data,
    };
    this.sports[index] = updatedSport;
    return updatedSport;
  }

  async delete(id: string): Promise<void> {
    this.sports = this.sports.filter((sport) => sport.id !== id);
  }
}
