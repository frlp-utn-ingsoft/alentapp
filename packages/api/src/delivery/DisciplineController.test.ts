import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisciplineController } from './DisciplineController.js';

describe('DisciplineController', () => {
    const mockCreateUseCase = { execute: vi.fn() };
    const mockGetUseCase = { execute: vi.fn() };
    const mockListUseCase = { execute: vi.fn() };
    const mockStatusUseCase = { execute: vi.fn() };
    const mockUpdateUseCase = { execute: vi.fn() };
    const mockDeleteUseCase = { execute: vi.fn() };

    const controller = new DisciplineController(
        mockCreateUseCase as any,
        mockGetUseCase as any,
        mockListUseCase as any,
        mockStatusUseCase as any,
        mockUpdateUseCase as any,
        mockDeleteUseCase as any,
    );

    const mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
    };

    const disciplineId = '22222222-2222-4222-8222-222222222222';
    const memberId = '11111111-1111-4111-8111-111111111111';
    const mockRequest = {
        body: { reason: 'Sancion' },
        params: { id: disciplineId, memberId },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('debe devolver status 201 y los datos si la creacion es exitosa', async () => {
            const mockDiscipline = { id: disciplineId, reason: 'Sancion' };
            mockCreateUseCase.execute.mockResolvedValueOnce(mockDiscipline);

            await controller.create(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockDiscipline });
        });

        it('debe devolver status 404 si el socio no existe', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(new Error('El socio especificado no existe'));

            await controller.create(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'El socio especificado no existe' });
        });

        it('debe devolver status 400 si las fechas son invalidas', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(new Error('Las fechas ingresadas no son validas'));

            await controller.create(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(400);
        });
    });

    describe('getById', () => {
        it('debe devolver status 200 y una sancion', async () => {
            const mockDiscipline = { id: disciplineId, reason: 'Sancion' };
            mockGetUseCase.execute.mockResolvedValueOnce(mockDiscipline);

            await controller.getById(mockRequest as any, mockReply as any);

            expect(mockGetUseCase.execute).toHaveBeenCalledWith(disciplineId);
            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockDiscipline });
        });

        it('debe devolver status 404 si la sancion no existe', async () => {
            mockGetUseCase.execute.mockRejectedValueOnce(new Error('La sancion no existe'));

            await controller.getById(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(404);
        });
    });

    describe('getByMember', () => {
        it('debe devolver status 200 y las sanciones del socio', async () => {
            const mockDisciplines = [{ id: disciplineId, reason: 'Sancion' }];
            mockListUseCase.execute.mockResolvedValueOnce(mockDisciplines);

            await controller.getByMember(mockRequest as any, mockReply as any);

            expect(mockListUseCase.execute).toHaveBeenCalledWith(memberId);
            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockDisciplines });
        });
    });

    describe('getMemberStatus', () => {
        it('debe devolver status 200 y el estado disciplinario', async () => {
            const mockStatus = { memberId, isSuspended: false };
            mockStatusUseCase.execute.mockResolvedValueOnce(mockStatus);

            await controller.getMemberStatus(mockRequest as any, mockReply as any);

            expect(mockStatusUseCase.execute).toHaveBeenCalledWith(memberId);
            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockStatus });
        });
    });

    describe('update', () => {
        it('debe devolver status 200 y los datos actualizados', async () => {
            const mockDiscipline = { id: disciplineId, reason: 'Actualizada' };
            mockUpdateUseCase.execute.mockResolvedValueOnce(mockDiscipline);

            await controller.update(mockRequest as any, mockReply as any);

            expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(disciplineId, { reason: 'Sancion' });
            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockDiscipline });
        });
    });

    describe('delete', () => {
        it('debe devolver status 204 si la eliminacion es exitosa', async () => {
            mockDeleteUseCase.execute.mockResolvedValueOnce(undefined);

            await controller.delete(mockRequest as any, mockReply as any);

            expect(mockDeleteUseCase.execute).toHaveBeenCalledWith(disciplineId);
            expect(mockReply.status).toHaveBeenCalledWith(204);
            expect(mockReply.send).toHaveBeenCalledWith();
        });
    });
});
