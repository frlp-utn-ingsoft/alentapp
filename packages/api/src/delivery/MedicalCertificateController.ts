import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateMedicalCertificateRequest } from '@alentapp/shared';
import { CreateMedicalCertificateUseCase } from '../application/NewMedicalCertificateUseCase.js';

export class MedicalCertificateController {
  constructor(
    private readonly createUseCase: CreateMedicalCertificateUseCase,
  ) {}

  async create(
    request: FastifyRequest<{ Body: CreateMedicalCertificateRequest }>,
    reply: FastifyReply,
  ) {
    try {
      request.log.info('Iniciando registro de nuevo certificado médico');

      const certificate = await this.createUseCase.execute(request.body);

      return reply.status(201).send({ data: certificate });
    } catch (error: any) {
      if (
        error.message.includes('obligatoria') ||
        error.message.includes('posterior') ||
        error.message.includes('no son válidas')
      ) {
        return reply.status(400).send({ error: error.message });
      }

      if (error.message.includes('no se encuentra registrado')) {
        return reply.status(404).send({ error: error.message });
      }

      request.log.error(
        `[MedicalCertificateController] Error: ${error.message}`,
      );

      return reply.status(500).send({
        error: 'Error interno, reintente más tarde',
      });
    }
  }
}