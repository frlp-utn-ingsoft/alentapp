import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateEnrollmentRequest } from '@alentapp/shared';
import { CreateEnrollmentUseCase } from '../application/CreateEnrollmentUseCase.js';
import { GetEnrollmentsUseCase } from '../application/GetEnrollmentsUseCase.js';
import { DeleteEnrollmentUseCase } from '../application/DeleteEnrollmentUseCase.js';

export class EnrollmentController {
  constructor(
    private readonly createEnrollmentUseCase: CreateEnrollmentUseCase,
    private readonly getEnrollmentsUseCase: GetEnrollmentsUseCase,
    private readonly deleteEnrollmentUseCase: DeleteEnrollmentUseCase,
  ) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const enrollments = await this.getEnrollmentsUseCase.execute();
      return reply.status(200).send({ data: enrollments });
    } catch (error: any) {
      return reply.status(500).send({ error: 'Error al obtener las inscripciones' });
    }
  }

  async create(
    request: FastifyRequest<{ Body: CreateEnrollmentRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const enrollment = await this.createEnrollmentUseCase.execute(request.body);
      return reply.status(201).send({ data: enrollment });
    } catch (error: any) {
      if (error.message.includes('ya está inscripto')) {
        return reply.status(409).send({ error: error.message });
      }
      if (error.message.includes('obligatorio') || error.message.includes('no existe')) {
        return reply.status(400).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      await this.deleteEnrollmentUseCase.execute(id);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.message.includes('no existe')) {
        return reply.status(400).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
    }
  }
}
