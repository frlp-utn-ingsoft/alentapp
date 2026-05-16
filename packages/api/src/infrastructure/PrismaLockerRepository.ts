import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { LockerRepository } from '../domain/LockerRepository.js';
import { LockerDTO, CreateLockerRequest, LockerStatus } from '@alentapp/shared';

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
    status: string;
    member_id: string | null;
};

export class PrismaLockerRepository implements LockerRepository {
    async existsByNumber(number: number): Promise<boolean> {
        const locker = await prisma.locker.findUnique({
            where: { number },
        });
        return locker !== null;
    }

    async save(data: CreateLockerRequest): Promise<LockerDTO> {
        const locker = await prisma.locker.create({
            data: {
                number: data.number,
                location: data.location,
                status: data.status,
                member_id: null,
            },
        });
        return this.mapToDTO(locker);
    }

    async findById(id: string): Promise<LockerDTO | null> {
        const locker = await prisma.locker.findUnique({
            where: { id },
        });
        return locker ? this.mapToDTO(locker) : null;
    }

    async update(id: string, data: Partial<CreateLockerRequest & { member_id: string | null }>): Promise<LockerDTO> {
        const locker = await prisma.locker.update({
            where: { id },
            data: {
                ...(data.number !== undefined && { number: data.number }),
                ...(data.location !== undefined && { location: data.location }),
                ...(data.status !== undefined && { status: data.status }),
                ...(data.member_id !== undefined && { member_id: data.member_id }),
            },
        });
        return this.mapToDTO(locker);
    }

    async delete(id: string): Promise<void> {
        await prisma.locker.delete({
            where: { id },
        });
    }

    private mapToDTO(locker: DBLocker): LockerDTO {
        return {
            id: locker.id,
            number: locker.number,
            location: locker.location,
            status: locker.status as LockerStatus,
            member_id: locker.member_id,
        };
    }
    async findAll(): Promise<LockerDTO[]> {
        const lockers = await prisma.locker.findMany({
            orderBy: { number: 'asc' },
        });
        return lockers.map(this.mapToDTO.bind(this));
    }
}