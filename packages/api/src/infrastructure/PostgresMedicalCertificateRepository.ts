import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { MedicalCertificateRepository } from '../domain/MedicalCertificateRepository.js';
import { MedicalCertificateResponseDTO, MedicalCertificateListItem } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBCertificate = {
    id: string;
    issue_date: Date;
    expiry_date: Date;
    doctor_license: string;
    institution: string;
    status: 'in_review' | 'validated' | 'historical';
    deleted_at: Date | null;
    member_id: string;
};

type DBCertificateWithMember = DBCertificate & {
    member: {
        dni: string;
    };
};

export class PostgresMedicalCertificateRepository implements MedicalCertificateRepository {
    async findAll(): Promise<MedicalCertificateListItem[]> {
        const certificates = await prisma.medicalCertificate.findMany({
            where: { deleted_at: null },
            include: { member: true },
            orderBy: { issue_date: 'desc' },
        });

        return certificates.map((cert) => this.mapToListItem(cert));
    }

    async save(data: Omit<MedicalCertificateResponseDTO, 'id' | 'deleted_at'>): Promise<MedicalCertificateResponseDTO> {
        const certificate = await prisma.medicalCertificate.create({
            data: {
                member_id: data.member_id,
                issue_date: new Date(data.issue_date),
                expiry_date: new Date(data.expiry_date),
                doctor_license: data.doctor_license,
                institution: data.institution,
                status: data.status,
            },
        });

        return this.mapToDTO(certificate);
    }

    private mapToDTO(cert: DBCertificate): MedicalCertificateResponseDTO {
        return {
            id: cert.id,
            member_id: cert.member_id,
            issue_date: cert.issue_date.toISOString().split('T')[0],
            expiry_date: cert.expiry_date.toISOString().split('T')[0],
            doctor_license: cert.doctor_license,
            institution: cert.institution,
            status: cert.status,
            deleted_at: cert.deleted_at ? cert.deleted_at.toISOString() : null,
        };
    }

    private mapToListItem(cert: DBCertificateWithMember): MedicalCertificateListItem {
        return {
            ...this.mapToDTO(cert),
            member_dni: cert.member.dni,
        };
    }
}
