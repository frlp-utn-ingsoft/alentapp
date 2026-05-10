import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { CreateDisciplineRequest } from '@alentapp/shared';

const memberId = '11111111-1111-4111-8111-111111111111';
const disciplineId = '22222222-2222-4222-8222-222222222222';
const discipline = {
    id: disciplineId,
    reason: 'Conducta antideportiva',
    startDate: '2026-05-01T00:00:00.000Z',
    endDate: '2026-06-01T00:00:00.000Z',
    isTotalSuspension: true,
    memberId,
};

vi.mock('../infrastructure/PostgresMemberRepository.js', () => {
    return {
        PostgresMemberRepository: class {
            async findAll() { return [{ id: memberId, name: 'Socio Existente' }]; }
            async findById(id: string) { return id === memberId ? { id: memberId, name: 'Socio Existente' } : null; }
            async findByDni() { return null; }
            async create(data: any) { return { id: memberId, ...data }; }
            async update(id: string, data: any) { return { id, ...data }; }
            async delete() { return; }
        },
    };
});

vi.mock('../infrastructure/PostgresDisciplineRepository.js', () => {
    return {
        PostgresDisciplineRepository: class {
            async create(data: any) { return { id: disciplineId, ...data }; }
            async findById(id: string) { return id === disciplineId ? discipline : null; }
            async findByMemberId(id: string) { return id === memberId ? [discipline] : []; }
            async findActiveTotalSuspensionByMemberId(id: string) { return id === memberId ? discipline : null; }
            async update(id: string, data: any) { return { ...discipline, id, ...data }; }
            async delete() { return; }
        },
    };
});

describe('Discipline API Integration Tests', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = buildApp();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/v1/disciplines', () => {
        it('debe retornar 201 y crear la sancion', async () => {
            const payload: CreateDisciplineRequest = {
                reason: 'Conducta antideportiva',
                startDate: '2026-05-01T00:00:00.000Z',
                endDate: '2026-06-01T00:00:00.000Z',
                isTotalSuspension: true,
                memberId,
            };

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/disciplines',
                payload,
            });

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.payload);
            expect(body.data.id).toBe(disciplineId);
            expect(body.data.reason).toBe('Conducta antideportiva');
        });

        it('debe retornar 404 si el socio no existe', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/disciplines',
                payload: {
                    reason: 'Conducta antideportiva',
                    startDate: '2026-05-01T00:00:00.000Z',
                    endDate: '2026-06-01T00:00:00.000Z',
                    isTotalSuspension: true,
                    memberId: '33333333-3333-4333-8333-333333333333',
                },
            });

            expect(response.statusCode).toBe(404);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('El socio especificado no existe');
        });

        it('debe retornar 400 si faltan campos requeridos', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/disciplines',
                payload: {
                    reason: 'Conducta antideportiva',
                    memberId,
                },
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('Faltan campos requeridos');
        });

        it('debe retornar 400 si la fecha de fin no es posterior a la de inicio', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/disciplines',
                payload: {
                    reason: 'Conducta antideportiva',
                    startDate: '2026-06-01T00:00:00.000Z',
                    endDate: '2026-05-01T00:00:00.000Z',
                    isTotalSuspension: true,
                    memberId,
                },
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('La fecha de fin debe ser posterior a la de inicio');
        });

        it('debe retornar 400 si una fecha no existe en el calendario', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/disciplines',
                payload: {
                    reason: 'Conducta antideportiva',
                    startDate: '2026-02-31',
                    endDate: '2026-06-01',
                    isTotalSuspension: true,
                    memberId,
                },
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('Las fechas ingresadas no son validas');
        });
    });

    describe('GET /api/v1/disciplines/:id', () => {
        it('debe retornar 200 y una sancion', async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/disciplines/${disciplineId}`,
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.payload);
            expect(body.data.id).toBe(disciplineId);
        });
    });

    describe('GET /api/v1/members/:memberId/disciplines', () => {
        it('debe retornar 200 y las sanciones del socio', async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/members/${memberId}/disciplines`,
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.payload);
            expect(body.data).toHaveLength(1);
        });
    });

    describe('GET /api/v1/members/:memberId/discipline-status', () => {
        it('debe retornar 200 y el estado disciplinario', async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/members/${memberId}/discipline-status`,
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.payload);
            expect(body.data.isSuspended).toBe(true);
        });
    });

    describe('PUT /api/v1/disciplines/:id', () => {
        it('debe retornar 200 y actualizar la sancion', async () => {
            const response = await app.inject({
                method: 'PUT',
                url: `/api/v1/disciplines/${disciplineId}`,
                payload: { reason: 'Actualizada' },
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.payload);
            expect(body.data.reason).toBe('Actualizada');
        });

        it('debe retornar 400 si la actualizacion deja una fecha invalida', async () => {
            const response = await app.inject({
                method: 'PUT',
                url: `/api/v1/disciplines/${disciplineId}`,
                payload: { startDate: null },
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('Las fechas ingresadas no son validas');
        });
    });

    describe('DELETE /api/v1/disciplines/:id', () => {
        it('debe retornar 204 si se elimina correctamente', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/disciplines/${disciplineId}`,
            });

            expect(response.statusCode).toBe(204);
            expect(response.payload).toBe('');
        });
    });
});
