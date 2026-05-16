import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../generated/client/client.js';

import { MedicalCertificateRepository }
from '../domain/MedicalCertificateRepository.js';

import {
  MedicalCertificateDTO,
  CreateMedicalCertificateRequest,
} from '@alentapp/shared';

const connectionString =
  process.env.DATABASE_URL as string;

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

export class PostgresMedicalCertificateRepository
  implements MedicalCertificateRepository {

  async invalidatePreviousCertificates(
    memberId: string
  ): Promise<void> {

    await prisma.medicalCertificate.updateMany({
      where: {
        memberId,
        isValidated: true,
        deletedAt: null,
      },
      data: {
        isValidated: false,
      },
    });
  }

  async create(
    data: CreateMedicalCertificateRequest
  ): Promise<MedicalCertificateDTO> {

    try {

      const medicalCertificate =
        await prisma.medicalCertificate.create({
          data: {
            memberId: data.memberId,
            expiryDate: new Date(data.expiryDate),
            doctorLicense: data.doctorLicense,
            isValidated: true,
          },
        });

      return {
        id: medicalCertificate.id,
        issueDate:
          medicalCertificate.issueDate.toISOString(),

        expiryDate:
          medicalCertificate.expiryDate.toISOString(),

        doctorLicense:
          medicalCertificate.doctorLicense,

        isValidated:
          medicalCertificate.isValidated,

        deletedAt:
          medicalCertificate.deletedAt
            ? medicalCertificate.deletedAt.toISOString()
            : null,

        memberId:
          medicalCertificate.memberId,
      };

    } catch (error) {

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(
          'Error interno, reintente más tarde'
        );
      }

      throw error;
    }
  }
}