import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';
import { EnrollmentDTO, UpdateEnrollmentRequest } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBEnrollment = {
    id: string;
    member_id: string;
    sport_id: string;
    enrollment_date: Date;
    is_active: boolean;
    member?: { name: string };
    sport?: { name: string };
};

export class PostgresEnrollmentRepository implements EnrollmentRepository {
    async create(data: { member_id: string; sport_id: string }): Promise<EnrollmentDTO> {
        const enrollment = await prisma.enrollment.create({
            data: {
                member_id: data.member_id,
                sport_id: data.sport_id,
            },
            include: {
                member: { select: { name: true } },
                sport: { select: { name: true } },
            },
        });

        return this.mapToDTO(enrollment);
    }

    async findById(id: string): Promise<EnrollmentDTO | null> {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id },
            include: {
                member: { select: { name: true } },
                sport: { select: { name: true } },
            },
        });

        return enrollment ? this.mapToDTO(enrollment) : null;
    }

    async findByMemberAndSport(memberId: string, sportId: string): Promise<EnrollmentDTO | null> {
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                member_id_sport_id: {
                    member_id: memberId,
                    sport_id: sportId,
                },
            },
            include: {
                member: { select: { name: true } },
                sport: { select: { name: true } },
            },
        });

        return enrollment ? this.mapToDTO(enrollment) : null;
    }

    async findAll(): Promise<EnrollmentDTO[]> {
        const enrollments = await prisma.enrollment.findMany({
            include: {
                member: { select: { name: true } },
                sport: { select: { name: true } },
            },
            orderBy: { enrollment_date: 'desc' },
        });

        return enrollments.map(this.mapToDTO);
    }

    async update(id: string, data: UpdateEnrollmentRequest): Promise<EnrollmentDTO> {
        const enrollment = await prisma.enrollment.update({
            where: { id },
            data: {
                ...(data.is_active !== undefined && { is_active: data.is_active }),
            },
            include: {
                member: { select: { name: true } },
                sport: { select: { name: true } },
            },
        });

        return this.mapToDTO(enrollment);
    }

    async delete(id: string): Promise<void> {
        await prisma.enrollment.delete({
            where: { id },
        });
    }

    async countActiveBySport(sportId: string): Promise<number> {
        return prisma.enrollment.count({
            where: {
                sport_id: sportId,
                is_active: true,
            },
        });
    }

    private mapToDTO(enrollment: DBEnrollment): EnrollmentDTO {
        return {
            id: enrollment.id,
            member_id: enrollment.member_id,
            sport_id: enrollment.sport_id,
            enrollment_date: enrollment.enrollment_date.toISOString(),
            is_active: enrollment.is_active,
            member_name: enrollment.member?.name,
            sport_name: enrollment.sport?.name,
        };
    }
}
