import { FastifyRequest, FastifyReply } from 'fastify';

import { CreateMedicalCertificateUseCase }
from '../application/CreateMedicalCertificateUseCase.js';

import {
    CreateMedicalCertificateRequest,
} from '@alentapp/shared';

export class MedicalCertificateController {

    constructor(
        private readonly createMedicalCertificateUseCase:
            CreateMedicalCertificateUseCase,
    ) {}

    async create(
        request: FastifyRequest<{
            Body: CreateMedicalCertificateRequest;
        }>,
        reply: FastifyReply,
    ) {
        try {

            const medicalCertificate =
                await this.createMedicalCertificateUseCase.execute(
                    request.body,
                );

            return reply.status(201).send({
                data: medicalCertificate,
            });

        } catch (error: any) {

            if (error.message.includes('no existe')) {
                return reply.status(404).send({
                    error: error.message,
                });
            }

            if (
                error.message.includes('obligatorio') ||
                error.message.includes('inválido') ||
                error.message.includes('posterior')
            ) {
                return reply.status(400).send({
                    error: error.message,
                });
            }

            return reply.status(500).send({
                error: 'Error interno, reintente más tarde',
            });
        }
    }
}