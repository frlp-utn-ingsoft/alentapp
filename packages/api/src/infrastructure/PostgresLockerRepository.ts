import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { LockerRepository } from '../domain/LockerRepository.js';
import { LockerDTO } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBLocker = {
    id: string;
    number: number;
    location: string;
    status: 'Disponible' | 'Ocupado' | 'Mantenimiento';
    member_id: string | null;
    member?: { name: string } | null;
};

export class PostgresLockerRepository implements LockerRepository {
    async create(data: Omit<LockerDTO, 'id'>): Promise<LockerDTO> {
        const locker = await prisma.locker.create({
            data: {
                number: data.number,
                location: data.location,
                status: data.status,
                member_id: data.member_id,
            },
        });

        return this.mapToDTO(locker);
    }

    async findAll(): Promise<LockerDTO[]> {
        const lockers = await prisma.locker.findMany({
            include: {
                member: { select: { name: true } },
            },
            orderBy: { number: 'asc' },
        });

        return lockers.map((locker) => this.mapToDTO(locker));
    }

    async findByNumber(number: number): Promise<LockerDTO | null> {
        const locker = await prisma.locker.findUnique({
            where: { number },
        });

        return locker ? this.mapToDTO(locker) : null;
    }

    private mapToDTO(locker: DBLocker): LockerDTO {
        return {
            id: locker.id,
            number: locker.number,
            location: locker.location,
            status: locker.status,
            member_id: locker.member_id,
            member: locker.member ?? null,
        };
    }
}
