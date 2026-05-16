import { DisciplineDTO } from '@alentapp/shared';

// Esta interfaz es el "Puerto de Salida". El dominio dice: 
// "No me importa si usás Postgres o Mongo, dame un objeto que cumpla esto".

export interface DisciplineRepository {
    create(discipline: Omit<DisciplineDTO, 'id'>): Promise<DisciplineDTO>;
    findAll(): Promise<DisciplineDTO[]>;
}

