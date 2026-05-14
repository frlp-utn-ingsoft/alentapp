import { CreateSportRequest, SportResponse, UpdateSportRequest } from '@alentapp/shared';

export interface SportRepository {
  create(sport: CreateSportRequest): Promise<SportResponse>;
  findAll(): Promise<SportResponse[]>;
  findById(id: string): Promise<SportResponse | null>;
  findByName(name: string): Promise<SportResponse | null>;
  update(id: string, data: UpdateSportRequest): Promise<SportResponse>;
  delete(id: string): Promise<void>;
}
