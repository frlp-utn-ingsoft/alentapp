import { DisciplineResponse, CreateDisciplineRequest, UpdateDisciplineRequest } from '@alentapp/shared';

export interface IDisciplineRepository {
    create(discipline: Omit<DisciplineResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<DisciplineResponse>;
}