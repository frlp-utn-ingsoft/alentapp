import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SportsView } from './Sports';
import { sportsService } from '../services/sports';
import { Provider } from '../components/ui/provider';
import type { SportResponse } from '@alentapp/shared';

vi.mock('../services/sports', () => ({
  sportsService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('SportsView', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<Provider>{ui}</Provider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el estado de carga y luego renderizar una tabla vacía', async () => {
    vi.mocked(sportsService.getAll).mockResolvedValueOnce([]);

    renderWithProviders(<SportsView />);

    expect(screen.getByText('Cargando deportes...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Cargando deportes...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No se encontraron deportes.')).toBeInTheDocument();
  });

  it('debe renderizar la lista de deportes si el backend responde exitosamente', async () => {
    const mockSports = [
      {
        id: '1',
        name: 'Fútbol',
        description: 'Cancha de fútbol 5',
        max_capacity: 20,
        additional_price: 1500,
        requires_medical_certificate: true,
      },
      {
        id: '2',
        name: 'Ajedrez',
        description: 'Taller recreativo',
        max_capacity: 12,
        additional_price: 0,
        requires_medical_certificate: false,
      },
    ] as SportResponse[];
    vi.mocked(sportsService.getAll).mockResolvedValueOnce(mockSports);

    renderWithProviders(<SportsView />);

    await waitFor(() => {
      expect(screen.getByText('Fútbol')).toBeInTheDocument();
    });

    expect(screen.getByText('Cancha de fútbol 5')).toBeInTheDocument();
    expect(screen.getByText('$1500')).toBeInTheDocument();
    expect(screen.getByText('Ajedrez')).toBeInTheDocument();
    expect(screen.getByText('No requerido')).toBeInTheDocument();
  });

  it('debe renderizar un mensaje de error si el servicio backend falla', async () => {
    vi.mocked(sportsService.getAll).mockRejectedValueOnce(new Error('Servidor caído'));

    renderWithProviders(<SportsView />);

    await waitFor(() => {
      expect(screen.getByText('Servidor caído')).toBeInTheDocument();
    });
  });

  it('debe permitir crear un nuevo deporte mediante el formulario', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(sportsService.getAll).mockResolvedValue([]);
    vi.mocked(sportsService.create).mockResolvedValueOnce({
      id: '3',
      name: 'Básquet',
      description: 'Entrenamiento mixto',
      max_capacity: 15,
      additional_price: 2500,
      requires_medical_certificate: true,
    });

    renderWithProviders(<SportsView />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando deportes...')).not.toBeInTheDocument();
    });

    await user.click(screen.getByText(/Agregar Deporte/i));

    await user.type(screen.getByPlaceholderText('Ej. Fútbol'), 'Básquet');
    await user.type(screen.getByPlaceholderText('Ej. Entrenamiento recreativo y competitivo'), 'Entrenamiento mixto');
    fireEvent.change(screen.getByLabelText(/Cupo máximo/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/Precio adicional/i), { target: { value: '2500' } });
    await user.click(screen.getByLabelText('Requiere certificado médico'));

    await user.click(screen.getByText('Crear Deporte'));

    expect(sportsService.create).toHaveBeenCalledWith({
      name: 'Básquet',
      description: 'Entrenamiento mixto',
      max_capacity: 15,
      additional_price: 2500,
      requires_medical_certificate: true,
    });
  });

  it('debe permitir editar un deporte sin enviar el nombre en el payload', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const mockSports = [
      {
        id: '1',
        name: 'Fútbol',
        description: 'Cancha de fútbol 5',
        max_capacity: 20,
        additional_price: 1500,
        requires_medical_certificate: true,
      },
    ] as SportResponse[];

    vi.mocked(sportsService.getAll).mockResolvedValue(mockSports);
    vi.mocked(sportsService.update).mockResolvedValueOnce({
      ...mockSports[0],
      description: 'Cancha cubierta',
    });

    renderWithProviders(<SportsView />);

    await waitFor(() => {
      expect(screen.getByText('Fútbol')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/Editar deporte/i));

    const descriptionInput = screen.getByPlaceholderText('Ej. Entrenamiento recreativo y competitivo');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Cancha cubierta');

    await user.click(screen.getByText('Guardar Cambios'));

    expect(sportsService.update).toHaveBeenCalledWith('1', expect.objectContaining({
      description: 'Cancha cubierta',
      max_capacity: 20,
      additional_price: 1500,
      requires_medical_certificate: true,
    }));
    expect(sportsService.update).not.toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Fútbol' }));
  });

  it('debe permitir eliminar un deporte con confirmación', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const mockSports = [
      {
        id: '1',
        name: 'Fútbol',
        description: 'Cancha de fútbol 5',
        max_capacity: 20,
        additional_price: 1500,
        requires_medical_certificate: true,
      },
    ] as SportResponse[];

    vi.mocked(sportsService.getAll).mockResolvedValue(mockSports);
    vi.mocked(sportsService.delete).mockResolvedValueOnce(undefined);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<SportsView />);

    await waitFor(() => {
      expect(screen.getByText('Fútbol')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/Eliminar deporte/i));

    expect(confirmSpy).toHaveBeenCalledWith('¿Estás seguro de que deseas eliminar el deporte "Fútbol"? Esta acción no se puede deshacer.');
    expect(sportsService.delete).toHaveBeenCalledWith('1');

    confirmSpy.mockRestore();
  });
});
