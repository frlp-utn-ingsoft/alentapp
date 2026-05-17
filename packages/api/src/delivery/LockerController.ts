import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateLockerRequest } from '@alentapp/shared';
import { CreateLockerUseCase } from '../application/Locker/NewLockerUseCase.js';
import { GetLockersUseCase } from '../application/Locker/GetLockersUseCase.js';

export class LockerController {
    constructor(
        private readonly createLockerUseCase: CreateLockerUseCase,
        private readonly getLockersUseCase: GetLockersUseCase,
    ) {}

    async create(
        request: FastifyRequest<{ Body: CreateLockerRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const locker = await this.createLockerUseCase.execute(request.body);

            return reply.status(201).send({ data: locker });
        } catch (error: any) {
            if (
                error.message.includes('El socio no existe') ||
                error.message.includes('debe ser positivo') ||
                error.message.includes('ubicación es obligatoria') ||
                error.message.includes('no puede tener un socio asignado')
            ) {
                return reply.status(400).send({ error: error.message });
            }

            if (error.message.includes('Ya existe un Locker con ese número')) {
                return reply.status(409).send({ error: error.message });
            }

            return reply
                .status(500)
                .send({ error: 'Error interno, reintente más tarde' });
        }
    }

    async getAll(_request: FastifyRequest, reply: FastifyReply) {
        try {
            const lockers = await this.getLockersUseCase.execute();
            return reply.status(200).send({ data: lockers });
        } catch {
            return reply
                .status(500)
                .send({ error: 'Error interno, reintente más tarde' });
        }
    }
}
