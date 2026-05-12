import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CreateSportUseCase } from './CreateSportUseCase.js';
import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';
import { CreateSportRequest } from '@alentapp/shared';

describe('CreateSportUseCase', () => {
  const mockSportRepo = {
    create: vi.fn(),
  } as unknown as SportRepository;

  const mockSportValidator = {
    validateNameIsRequired: vi.fn(),
    validateMaxCapacity: vi.fn(),
    validateNameIsUnique: vi.fn(),
  } as unknown as SportValidator;

  const useCase = new CreateSportUseCase(mockSportRepo, mockSportValidator);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe crear un deporte si pasa las validaciones de negocio', async () => {
    const request: CreateSportRequest = {
      name: ' Fútbol ',
      description: ' Cancha de fútbol 5 ',
      max_capacity: 20,
      additional_price: 1500,
      requires_medical_certificate: true,
    };

    vi.mocked(mockSportRepo.create).mockResolvedValueOnce({
      id: 'sport-1',
      name: 'Fútbol',
      description: 'Cancha de fútbol 5',
      max_capacity: 20,
      additional_price: 1500,
      requires_medical_certificate: true,
    });

    const result = await useCase.execute(request);

    expect(mockSportValidator.validateNameIsRequired).toHaveBeenCalledWith(' Fútbol ');
    expect(mockSportValidator.validateMaxCapacity).toHaveBeenCalledWith(20);
    expect(mockSportValidator.validateNameIsUnique).toHaveBeenCalledWith(' Fútbol ');
    expect(mockSportRepo.create).toHaveBeenCalledWith({
      ...request,
      name: 'Fútbol',
      description: 'Cancha de fútbol 5',
    });
    expect(result.id).toBe('sport-1');
  });
});
