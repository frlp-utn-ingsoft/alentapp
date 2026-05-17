import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CreateEnrollmentUseCase } from './CreateEnrollmentUseCase.js';
import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { SportRepository } from '../domain/SportRepository.js';

describe('CreateEnrollmentUseCase', () => {
  const mockEnrollmentRepo = {
    create: vi.fn(),
    existsByMemberAndSport: vi.fn(),
  } as unknown as EnrollmentRepository;

  const mockMemberRepo = {
    findById: vi.fn(),
  } as unknown as MemberRepository;

  const mockSportRepo = {
    findById: vi.fn(),
  } as unknown as SportRepository;

  const useCase = new CreateEnrollmentUseCase(mockEnrollmentRepo, mockMemberRepo, mockSportRepo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe crear una inscripción si socio y deporte existen y no hay duplicado', async () => {
    const request = { member_id: 'member-1', sport_id: 'sport-1' };
    const enrollment = {
      id: 'enrollment-1',
      member_id: 'member-1',
      sport_id: 'sport-1',
      enrollment_date: new Date().toISOString(),
      is_active: true,
    };

    vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({ id: 'member-1' } as any);
    vi.mocked(mockSportRepo.findById).mockResolvedValueOnce({ id: 'sport-1' } as any);
    vi.mocked(mockEnrollmentRepo.existsByMemberAndSport).mockResolvedValueOnce(false);
    vi.mocked(mockEnrollmentRepo.create).mockResolvedValueOnce(enrollment);

    const result = await useCase.execute(request);

    expect(result).toEqual(enrollment);
    expect(mockEnrollmentRepo.create).toHaveBeenCalledWith(request);
  });

  it('debe rechazar si el socio no existe', async () => {
    vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce(null);

    await expect(useCase.execute({ member_id: 'member-x', sport_id: 'sport-1' })).rejects.toThrow(
      'El socio no existe',
    );
    expect(mockEnrollmentRepo.create).not.toHaveBeenCalled();
  });

  it('debe rechazar si el deporte no existe', async () => {
    vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({ id: 'member-1' } as any);
    vi.mocked(mockSportRepo.findById).mockResolvedValueOnce(null);

    await expect(useCase.execute({ member_id: 'member-1', sport_id: 'sport-x' })).rejects.toThrow(
      'El deporte no existe',
    );
    expect(mockEnrollmentRepo.create).not.toHaveBeenCalled();
  });

  it('debe rechazar si ya existe inscripción para el socio y deporte', async () => {
    vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({ id: 'member-1' } as any);
    vi.mocked(mockSportRepo.findById).mockResolvedValueOnce({ id: 'sport-1' } as any);
    vi.mocked(mockEnrollmentRepo.existsByMemberAndSport).mockResolvedValueOnce(true);

    await expect(useCase.execute({ member_id: 'member-1', sport_id: 'sport-1' })).rejects.toThrow(
      'El socio ya está inscripto en ese deporte',
    );
    expect(mockEnrollmentRepo.create).not.toHaveBeenCalled();
  });
});
