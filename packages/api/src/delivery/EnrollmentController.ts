import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateEnrollmentUseCase } from '../application/CreateEnrollmentUseCase.js';
import { GetEnrollmentsUseCase } from '../application/GetEnrollmentsUseCase.js';
import { UpdateEnrollmentUseCase } from '../application/UpdateEnrollmentUseCase.js';
import { DeleteEnrollmentUseCase } from '../application/DeleteEnrollmentUseCase.js';
import { CreateEnrollmentRequest, UpdateEnrollmentRequest } from '@alentapp/shared';

export class EnrollmentController {
    constructor(
        private readonly createEnrollmentUseCase: CreateEnrollmentUseCase,
        private readonly getEnrollmentsUseCase: GetEnrollmentsUseCase,
        private readonly updateEnrollmentUseCase: UpdateEnrollmentUseCase,
        private readonly deleteEnrollmentUseCase: DeleteEnrollmentUseCase,
    ) {}

    async getAll(_request: FastifyRequest, reply: FastifyReply) {
        try {
            const enrollments = await this.getEnrollmentsUseCase.execute();
            return reply.status(200).send({ data: enrollments });
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
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
            if (error.message.includes('cupo máximo')) {
                return reply.status(409).send({ error: error.message });
            }
            if (error.message.includes('No existe')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }

    async update(
        request: FastifyRequest<{ Params: { id: string }; Body: UpdateEnrollmentRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;
            const enrollment = await this.updateEnrollmentUseCase.execute(id, request.body);
            return reply.status(200).send({ data: enrollment });
        } catch (error: any) {
            if (error.message.includes('No existe')) {
                return reply.status(404).send({ error: error.message });
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
            if (error.message.includes('No existe')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }
}
