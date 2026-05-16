import { SportDTO, UpdateMemberRequest } from '@alentapp/shared';

// Esta interfaz es el "Puerto de Salida". El dominio dice: 
// "No me importa si usás Postgres o Mongo, dame un objeto que cumpla esto".

export interface SportRepository {
  create(sport: Omit<SportDTO, 'id'>): Promise<SportDTO>;
  findByName(name: string): Promise<SportDTO | null>;
  findAll(): Promise<SportDTO[]>;
  findById(id: string): Promise<SportDTO | null>;
  update(id: string, data: UpdateMemberRequest): Promise<SportDTO>;
}