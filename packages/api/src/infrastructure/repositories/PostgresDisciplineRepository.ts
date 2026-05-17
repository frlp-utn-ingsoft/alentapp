import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/client/client.js';
import { IDisciplineRepository } from '../../application/ports/IDisciplineRepository.js';
import { DisciplineResponse, CreateDisciplineRequest } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBDiscipline = {
    id: string;
    motivo: string;
    fechaInicio: Date;
    fechaFin: Date;
    esSuspensionTotal: boolean;
    miembro_id: string;
    created_at: Date;
    updatedAt: Date;
};

export class PostgresDisciplineRepository implements IDisciplineRepository {
    async create(data: CreateDisciplineRequest): Promise<DisciplineResponse> {
        const sancion = await prisma.discipline.create({
            data: {
                motivo: data.motivo,
                fechaInicio: new Date(data.fechaInicio),
                fechaFin: new Date(data.fechaFin),
                esSuspensionTotal: data.esSuspensionTotal,
                miembro_id: data.miembro_id,
            },
        });

        return this.mapToDTO(sancion);
    }
    private mapToDTO(sancion: DBDiscipline): DisciplineResponse {
        return {
            id: sancion.id,
            motivo: sancion.motivo,
            fechaInicio: sancion.fechaInicio.toISOString().split('T')[0],
            fechaFin: sancion.fechaFin.toISOString().split('T')[0],
            esSuspensionTotal: sancion.esSuspensionTotal,
            miembro_id: sancion.miembro_id,
            created_at: sancion.created_at.toISOString(),
            updatedAt: sancion.updatedAt.toISOString(),
        };
    }
}