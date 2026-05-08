import { SportDTO, CreateSportRequest, UpdateSportRequest } from '@alentapp/shared';

// Puerto de Salida: define las operaciones de persistencia para Sport.
// La capa de dominio no sabe si se usa Postgres, Mongo u otra tecnología.

export interface SportRepository {
  create(sport: Omit<SportDTO, 'id' | 'deleted_at'>): Promise<SportDTO>;
  findActiveById(id: string): Promise<SportDTO | null>;
  findActiveByName(name: string): Promise<SportDTO | null>;
  findAllActive(): Promise<SportDTO[]>;
  update(id: string, data: UpdateSportRequest): Promise<SportDTO>;
  softDelete(id: string): Promise<void>;
}
