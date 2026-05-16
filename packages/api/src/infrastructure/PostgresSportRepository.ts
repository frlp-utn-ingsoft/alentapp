import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { SportRepository } from '../domain/SportRepository.js';
import { CreateSportRequest, SportDTO } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

// Tipo interno que representa cómo Prisma devuelve un Sport desde la base.
type DBSport = {
    id: string;
    name: string;
    description: string;
    max_capacity: number;
    additional_price: number;
    requires_medical_certificate: boolean;
    deleted_at: Date | null;
};

export class PostgresSportRepository implements SportRepository {
    // inserta un deporte nuevo. 
    async create(data: CreateSportRequest): Promise<SportDTO> {
        const sport = await prisma.sport.create({
            data: {
                name: data.name,
                description: data.description,
                max_capacity: data.max_capacity,
                additional_price: data.additional_price,
                requires_medical_certificate: data.requires_medical_certificate,

                // Todo deporte nuevo nace activo.
                deleted_at: null,
            },
        });

        return this.mapToDTO(sport);
    }

    // busca duplicados solo entre deportes activos.
    async findActiveByName(name: string): Promise<SportDTO | null> {
        const sport = await prisma.sport.findFirst({
            where: {
                name,
                deleted_at: null,
            },
        });

        return sport ? this.mapToDTO(sport) : null;
    }

    // lista deportes activos.
    async findAllActive(): Promise<SportDTO[]> {
        const sports = await prisma.sport.findMany({
            where: {
                deleted_at: null,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return sports.map((sport) => this.mapToDTO(sport));
    }

    // Transforma el resultado de Prisma en respuesta. 
    private mapToDTO(sport: DBSport): SportDTO {
        return {
            id: sport.id,
            name: sport.name,
            description: sport.description,
            max_capacity: sport.max_capacity,
            additional_price: sport.additional_price,
            requires_medical_certificate: sport.requires_medical_certificate,
            deleted_at: sport.deleted_at ? sport.deleted_at.toISOString() : null,
        };
    }
}