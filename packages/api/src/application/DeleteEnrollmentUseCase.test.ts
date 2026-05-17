import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DeleteEnrollmentUseCase } from './DeleteEnrollmentUseCase.js';
import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';

describe('DeleteEnrollmentUseCase', () => {
  const mockEnrollmentRepo = {
    findById: vi.fn(),
    delete: vi.fn(),
  } as unknown as EnrollmentRepository;

  const useCase = new DeleteEnrollmentUseCase(mockEnrollmentRepo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe eliminar una inscripción existente', async () => {
    vi.mocked(mockEnrollmentRepo.findById).mockResolvedValueOnce({ id: 'enrollment-1' } as any);

    await useCase.execute('enrollment-1');

    expect(mockEnrollmentRepo.findById).toHaveBeenCalledWith('enrollment-1');
    expect(mockEnrollmentRepo.delete).toHaveBeenCalledWith('enrollment-1');
  });

  it('debe rechazar la baja si la inscripción no existe', async () => {
    vi.mocked(mockEnrollmentRepo.findById).mockResolvedValueOnce(null);

    await expect(useCase.execute('enrollment-x')).rejects.toThrow('La inscripción no existe');
    expect(mockEnrollmentRepo.delete).not.toHaveBeenCalled();
  });
});
