import { CreateSportRequest, SportDTO } from '@alentapp/shared';

// Puerto de salida del dominio.
// Define las operaciones que necesitan los casos de uso sin depender de Prisma.
export interface SportRepository {
    // Crea un nuevo deporte.
    create(sport: CreateSportRequest): Promise<SportDTO>;

    // Busca un deporte activo por nombre.
    findActiveByName(name: string): Promise<SportDTO | null>;

    // Devuelve todos los deportes activos para mostrarlos en el listado.
    findAllActive(): Promise<SportDTO[]>;
}