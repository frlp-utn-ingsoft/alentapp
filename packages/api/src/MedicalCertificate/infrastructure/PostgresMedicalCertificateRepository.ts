import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/client/client.js';
import { MedicalCertificateRepository } from '../domain/services/medicalCertificateRepository.js';
import { MedicalCertificateDTO } from '../types/MedicalCertificate.js';

// Tipo interno que refleja lo que devuelve Prisma
type DBMedicalCertificate = {
    id: string;
    issue_date: Date;
    expiry_date: Date;
    doctor_license: string;
    is_validated: boolean;
    member_id: string;
};

export class PostgresMedicalCertificateRepository implements MedicalCertificateRepository {
    private prisma?: PrismaClient;

    private getPrisma(): PrismaClient {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        this.prisma ??= new PrismaClient({
            adapter: new PrismaPg(process.env.DATABASE_URL),
        });

        return this.prisma;
    }

    async findAll(): Promise<MedicalCertificateDTO[]> {
        const certificates = await this.getPrisma().medicalCertificate.findMany({
            orderBy: { expiry_date: 'desc' },
        });

        return certificates.map((certificate) => this.mapToDTO(certificate));
    }
    
    async create(data: Omit<MedicalCertificateDTO, 'id'>): Promise<MedicalCertificateDTO> {
        const certificate = await this.getPrisma().medicalCertificate.create({
            data: {
                issue_date: new Date(data.issue_date),
                expiry_date: new Date(data.expiry_date),
                doctor_license: data.doctor_license,
                is_validated: data.is_validated,
                member_id: data.member_id,
            },
        });

        return this.mapToDTO(certificate);
    }

    async findActiveByMemberId(memberId: string): Promise<MedicalCertificateDTO | null> {
        const certificate = await this.getPrisma().medicalCertificate.findFirst({
            where: {
                member_id: memberId,
                is_validated: true, // Solo buscamos el que está vigente
            },
        });

        return certificate ? this.mapToDTO(certificate) : null;
    }

    async invalidate(id: string): Promise<void> {
        await this.getPrisma().medicalCertificate.update({
            where: { id },
            data: {
                is_validated: false, // Lo marcamos como histórico/inválido
            },
        });
    }

    private mapToDTO(certificate: DBMedicalCertificate): MedicalCertificateDTO {
        return {
            id: certificate.id,
            issue_date: certificate.issue_date,
            expiry_date: certificate.expiry_date,
            doctor_license: certificate.doctor_license,
            is_validated: certificate.is_validated,
            member_id: certificate.member_id,
        };
    }
}
