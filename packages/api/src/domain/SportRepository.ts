import { SportDTO, CreateSportRequest } from '@alentapp/shared';

export interface SportRepository {
  create(sport: CreateSportRequest): Promise<SportDTO>;
  findByName(nombre: string): Promise<SportDTO | null>;
  findById(id: string): Promise<SportDTO | null>;
  update(id: string, data: Partial<SportDTO>): Promise<SportDTO>;
  countEnrolledMembers(id: string): Promise<number>;
}
