import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateEquipmentLoanUseCase } from './CreateEquipmentLoanUseCase.js';
import { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { CreateEquipmentLoanRequest } from '@alentapp/shared';

describe('CreateEquipmentLoanUseCase', () => {
    // Creamos los (Mocks) para los repositorios
    const mockEquipmentRepo = {
        create: vi.fn(),
    } as unknown as EquipmentLoanRepository;

    const mockMemberRepo = {
        findById: vi.fn(),
    } as unknown as MemberRepository;

    // Instanciamos el caso de uso inyectando los mocks
    const useCase = new CreateEquipmentLoanUseCase(mockEquipmentRepo, mockMemberRepo);

    // Limpiamos el historial de los mocks antes de cada test
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // TEST 1: No existe el socio
    it('debe lanzar un error si el socio no existe en la base de datos', async () => {
        const mockRequest: CreateEquipmentLoanRequest = {
            item_name: 'Pelota de Básquet',
            due_date: '2026-05-20',
            member_id: 'uuid-inexistente'
        };

        // Simulamos que la DB devuelve null (no lo encontró)
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce(null);

        // Verificamos que al ejecutar el useCase, la promesa se rechace con el error esperado
        await expect(useCase.execute(mockRequest)).rejects.toThrow('El socio referenciado no existe');
        
        // Verificamos que NUNCA se haya intentado crear el prestamo
        expect(mockEquipmentRepo.create).not.toHaveBeenCalled();
    });

    // TEST 2: Cadete prohibido
    it('debe lanzar un error si el socio tiene categoría Cadete', async () => {
        const mockRequest: CreateEquipmentLoanRequest = {
            item_name: 'Red de Vóley',
            due_date: '2026-05-20',
            member_id: 'uuid-cadete'
        };

        // Simulamos que la DB encuentra a un socio, pero es Cadete
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({
            id: 'uuid-cadete',
            dni: '12345678',
            name: 'Pablito',
            email: 'pablo@test.com',
            birthdate: '2010-01-01',
            category: 'Cadete',
            status: 'Activo',
            created_at: '2026-01-01T00:00:00.000Z'
        });

        // Verificamos que salte el error esperado
        await expect(useCase.execute(mockRequest)).rejects.toThrow('Los socios Cadete tienen prohibido solicitar material');
        
        // Verificamos que NUNCA se haya intentado crear el prestamo
        expect(mockEquipmentRepo.create).not.toHaveBeenCalled();
    });

    // TEST 3: Socio Pleno
    it('debe crear el préstamo exitosamente con estado Loaned si el socio es Honorario', async () => {
        const mockRequest: CreateEquipmentLoanRequest = {
            item_name: 'Conos de entrenamiento',
            due_date: '2026-05-20',
            member_id: 'uuid-honorario'
        };

        // Simulamos que la DB encuentra a un socio Honorario
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({
            id: 'uuid-honorario',
            dni: '87654321',
            name: 'Juan',
            email: 'juan@test.com',
            birthdate: '1990-01-01',
            category: 'Honorario',
            status: 'Activo',
            created_at: '2026-01-01T00:00:00.000Z'
        });

        // Simulamos qué nos devolvería la DB al guardar el prestamo
        vi.mocked(mockEquipmentRepo.create).mockResolvedValueOnce({
            id: 'loan-123',
            ...mockRequest,
            status: 'Loaned',
            loan_date: new Date().toISOString()
        });

        // Ejecutamos el caso de uso
        const result = await useCase.execute(mockRequest);

        // Verificamos que se haya intentado guardar en la DB con el estado inicial correcto
        expect(mockEquipmentRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            item_name: 'Conos de entrenamiento',
            member_id: 'uuid-honorario',
            status: 'Loaned' // Validamos que nazca prestado
        }));

        // Verificamos que la función nos devuelva el objeto creado
        expect(result.id).toBe('loan-123');
        expect(result.status).toBe('Loaned');
    });
});