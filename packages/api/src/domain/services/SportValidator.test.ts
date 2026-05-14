import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SportValidator } from './SportValidator.js';
import { SportRepository } from '../SportRepository.js';

describe('SportValidator', () => {
  const mockSportRepo = {
    findByName: vi.fn(),
  } as unknown as SportRepository;

  const validator = new SportValidator(mockSportRepo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe rechazar un nombre vacío', () => {
    expect(() => validator.validateNameIsRequired('   ')).toThrow('El nombre del deporte es obligatorio');
  });

  it('debe rechazar un cupo máximo menor o igual a cero', () => {
    expect(() => validator.validateMaxCapacity(0)).toThrow('El cupo máximo debe ser mayor a cero');
  });

  it('debe rechazar un nombre duplicado', async () => {
    vi.mocked(mockSportRepo.findByName).mockResolvedValueOnce({
      id: 'sport-1',
      name: 'Fútbol',
      description: 'Cancha de fútbol 5',
      max_capacity: 20,
      additional_price: 1500,
      requires_medical_certificate: true,
    });

    await expect(validator.validateNameIsUnique('Fútbol')).rejects.toThrow('Ya existe un deporte con ese nombre');
  });

  it('debe rechazar intentos de modificar el nombre', () => {
    expect(() => validator.validateNameIsImmutable({ name: 'Nuevo nombre' })).toThrow(
      'El nombre del deporte no puede modificarse',
    );
  });
});
