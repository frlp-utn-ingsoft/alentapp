import { CreateSportRequest, SportDTO } from '@alentapp/shared';

export interface SportRepository {
    create(sport: CreateSportRequest): Promise<SportDTO>;
    findById(id: string): Promise<SportDTO | null>;
}
