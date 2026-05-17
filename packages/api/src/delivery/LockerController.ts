import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateLockerUseCase } from '../application/CreateLockerUseCase.js';
import { GetLockersUseCase } from '../application/GetLockersUseCase.js';
import { CreateLockerRequest } from '@alentapp/shared';

export class LockerController {
    constructor(
        private readonly createLockerUseCase: CreateLockerUseCase,
        private readonly getLockerUseCase: GetLockersUseCase
    ) {}

    async create(
        request: FastifyRequest<{ Body: CreateLockerRequest }>,
        reply: FastifyReply,
    ) {
        try {
            request.log.info('Creación de locker solicitada');

            const locker = await this.createLockerUseCase.execute(request.body);

            return reply.status(201).send({ data: locker });
        } catch (error: any) {

            if (error.message.includes('Ya existe')) {
                return reply.status(409).send({ message: error.message });
            }

            if (
                error.message.includes('requeridos') ||
                error.message.includes('entero') ||
                error.message.includes('mayor a cero') ||
                error.message.includes('ubicación') ||
                error.message.includes('inválido')
            ) {
                return reply.status(400).send({ message: error.message });
            }

            return reply.status(500).send({
                message: 'Error interno, reintente más tarde',
            });
        }
    }

    async getAll(_request: FastifyRequest, reply: FastifyReply) {
        try {
            const lockers = await this.getLockerUseCase.execute();
            return reply.status(200).send({ data: lockers });
        } catch (error: any) {
            return reply.status(500).send({ error: 'Error interno' });
        }
    }
}