import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DeleteSportUseCase } from './DeleteSportUseCase.js';
import { SportRepository } from '../domain/SportRepository.js';
import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';

describe('DeleteSportUseCase', () => {
  const existingSport = {
    id: 'sport-1',
    name: 'Fútbol',
    description: 'Cancha de fútbol 5',
    max_capacity: 20,
    additional_price: 1500,
    requires_medical_certificate: true,
  };

  const mockSportRepo = {
    findById: vi.fn(),
    delete: vi.fn(),
  } as unknown as SportRepository;

  const mockEnrollmentRepo = {
    existsBySportId: vi.fn(),
  } as unknown as EnrollmentRepository;

  const useCase = new DeleteSportUseCase(mockSportRepo, mockEnrollmentRepo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe eliminar un deporte existente sin inscripciones', async () => {
    vi.mocked(mockSportRepo.findById).mockResolvedValueOnce(existingSport);
    vi.mocked(mockEnrollmentRepo.existsBySportId).mockResolvedValueOnce(false);

    await useCase.execute('sport-1');

    expect(mockSportRepo.findById).toHaveBeenCalledWith('sport-1');
    expect(mockEnrollmentRepo.existsBySportId).toHaveBeenCalledWith('sport-1');
    expect(mockSportRepo.delete).toHaveBeenCalledWith('sport-1');
  });

  it('debe rechazar la eliminación si el deporte no existe', async () => {
    vi.mocked(mockSportRepo.findById).mockResolvedValueOnce(null);

    await expect(useCase.execute('sport-x')).rejects.toThrow('El deporte no existe');
    expect(mockSportRepo.delete).not.toHaveBeenCalled();
  });

  it('debe rechazar la eliminación si tiene inscripciones asociadas', async () => {
    vi.mocked(mockSportRepo.findById).mockResolvedValueOnce(existingSport);
    vi.mocked(mockEnrollmentRepo.existsBySportId).mockResolvedValueOnce(true);

    await expect(useCase.execute('sport-1')).rejects.toThrow(
      'No se puede eliminar un deporte con inscripciones',
    );
    expect(mockSportRepo.delete).not.toHaveBeenCalled();
  });
});
