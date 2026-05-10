import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateDisciplineUseCase } from '../application/NewDisciplineUseCase.js';
import { GetDisciplineUseCase } from '../application/GetDisciplineUseCase.js';
import { ListMemberDisciplinesUseCase } from '../application/ListMemberDisciplinesUseCase.js';
import { GetMemberDisciplineStatusUseCase } from '../application/GetMemberDisciplineStatusUseCase.js';
import { UpdateDisciplineUseCase } from '../application/UpdateDisciplineUseCase.js';
import { DeleteDisciplineUseCase } from '../application/DeleteDisciplineUseCase.js';
import { CreateDisciplineRequest, UpdateDisciplineRequest } from '@alentapp/shared';

export class DisciplineController {
    constructor(
        private readonly createDisciplineUseCase: CreateDisciplineUseCase,
        private readonly getDisciplineUseCase: GetDisciplineUseCase,
        private readonly listMemberDisciplinesUseCase: ListMemberDisciplinesUseCase,
        private readonly getMemberDisciplineStatusUseCase: GetMemberDisciplineStatusUseCase,
        private readonly updateDisciplineUseCase: UpdateDisciplineUseCase,
        private readonly deleteDisciplineUseCase: DeleteDisciplineUseCase,
    ) {}

    async getById(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const discipline = await this.getDisciplineUseCase.execute(request.params.id);
            return reply.status(200).send({ data: discipline });
        } catch (error: any) {
            return this.handleError(error, reply);
        }
    }

    async getByMember(
        request: FastifyRequest<{ Params: { memberId: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const disciplines = await this.listMemberDisciplinesUseCase.execute(request.params.memberId);
            return reply.status(200).send({ data: disciplines });
        } catch (error: any) {
            return this.handleError(error, reply);
        }
    }

    async getMemberStatus(
        request: FastifyRequest<{ Params: { memberId: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const status = await this.getMemberDisciplineStatusUseCase.execute(request.params.memberId);
            return reply.status(200).send({ data: status });
        } catch (error: any) {
            return this.handleError(error, reply);
        }
    }

    async create(
        request: FastifyRequest<{ Body: CreateDisciplineRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const discipline = await this.createDisciplineUseCase.execute(request.body);
            return reply.status(201).send({ data: discipline });
        } catch (error: any) {
            return this.handleError(error, reply);
        }
    }

    async update(
        request: FastifyRequest<{ Params: { id: string }; Body: UpdateDisciplineRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const discipline = await this.updateDisciplineUseCase.execute(request.params.id, request.body);
            return reply.status(200).send({ data: discipline });
        } catch (error: any) {
            return this.handleError(error, reply);
        }
    }

    async delete(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
    ) {
        try {
            await this.deleteDisciplineUseCase.execute(request.params.id);
            return reply.status(204).send();
        } catch (error: any) {
            return this.handleError(error, reply);
        }
    }

    private handleError(error: Error, reply: FastifyReply) {
        if (
            error.message.includes('no es valido') ||
            error.message.includes('Faltan campos requeridos') ||
            error.message.includes('obligatorio') ||
            error.message.includes('fechas') ||
            error.message.includes('fecha de fin')
        ) {
            return reply.status(400).send({ error: error.message });
        }

        if (error.message.includes('no existe')) {
            return reply.status(404).send({ error: error.message });
        }

        return reply.status(500).send({ error: 'Error interno, reintente mas tarde' });
    }
}
