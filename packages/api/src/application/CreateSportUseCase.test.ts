import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateSportUseCase } from './CreateSportUseCase.js';
import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';
import { CreateSportRequest } from '@alentapp/shared';

describe('CreateSportUseCase', () => {
    const mockSportRepo = {
        create: vi.fn(),
        findActiveByName: vi.fn(),
    } as unknown as SportRepository;

    const mockSportValidator = {
        validateName: vi.fn(),
        validateMaxCapacity: vi.fn(),
        validateAdditionalPrice: vi.fn(),
        validateNameIsUnique: vi.fn(),
    } as unknown as SportValidator;

    const useCase = new CreateSportUseCase(mockSportRepo, mockSportValidator);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe crear un deporte exitosamente con datos válidos', async () => {
        const mockRequest: CreateSportRequest = {
            name: 'Fútbol 11',
            description: 'Fútbol de cancha grande',
            max_capacity: 22,
            additional_price: 1500,
            requires_medical_certificate: true,
        };

        vi.mocked(mockSportRepo.create).mockResolvedValueOnce({
            id: 'uuid-1',
            name: 'Fútbol 11',
            description: 'Fútbol de cancha grande',
            max_capacity: 22,
            additional_price: 1500,
            requires_medical_certificate: true,
            deleted_at: null,
        });

        const result = await useCase.execute(mockRequest);

        expect(mockSportValidator.validateName).toHaveBeenCalledWith('Fútbol 11');
        expect(mockSportValidator.validateMaxCapacity).toHaveBeenCalledWith(22);
        expect(mockSportValidator.validateAdditionalPrice).toHaveBeenCalledWith(1500);
        expect(mockSportValidator.validateNameIsUnique).toHaveBeenCalledWith('Fútbol 11');

        expect(mockSportRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Fútbol 11',
            max_capacity: 22,
            additional_price: 1500,
            requires_medical_certificate: true,
        }));

        expect(result.id).toBe('uuid-1');
        expect(result.name).toBe('Fútbol 11');
    });

    it('debe asignar valores por defecto cuando los campos opcionales no se envían', async () => {
        const mockRequest: CreateSportRequest = {
            name: 'Natación',
            max_capacity: 30,
        };

        vi.mocked(mockSportRepo.create).mockResolvedValueOnce({
            id: 'uuid-2',
            name: 'Natación',
            description: null,
            max_capacity: 30,
            additional_price: 0,
            requires_medical_certificate: false,
            deleted_at: null,
        });

        await useCase.execute(mockRequest);

        expect(mockSportRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            description: null,
            additional_price: 0,
            requires_medical_certificate: false,
        }));
    });

    it('debe lanzar error si el nombre ya existe', async () => {
        const mockRequest: CreateSportRequest = {
            name: 'Fútbol 11',
            max_capacity: 22,
        };

        vi.mocked(mockSportValidator.validateNameIsUnique).mockRejectedValueOnce(
            new Error('Ya existe un deporte con ese nombre')
        );

        await expect(useCase.execute(mockRequest)).rejects.toThrow(
            'Ya existe un deporte con ese nombre'
        );
    });
});
