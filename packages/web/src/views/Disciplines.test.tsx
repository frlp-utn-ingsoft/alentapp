import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisciplinesView } from './Disciplines';
import { disciplinesService } from '../services/disciplines';
import { membersService } from '../services/members';
import { Provider } from '../components/ui/provider';

import type { DisciplineDTO, MemberDTO } from '@alentapp/shared';

vi.mock('../services/disciplines', () => ({
  disciplinesService: {
    getById: vi.fn(),
    getByMember: vi.fn(),
    getStatus: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('../services/members', () => ({
  membersService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

describe('DisciplinesView', () => {
  const member = {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Juan Perez',
    dni: '12345678',
    email: 'juan@test.com',
    birthdate: '1990-01-01',
    category: 'Pleno',
    status: 'Activo',
    created_at: new Date().toISOString()
  } as MemberDTO;

  const discipline = {
    id: '22222222-2222-4222-8222-222222222222',
    reason: 'Conducta antideportiva',
    startDate: '2026-05-01T00:00:00.000Z',
    endDate: '2026-06-01T00:00:00.000Z',
    isTotalSuspension: true,
    memberId: member.id
  } as DisciplineDTO;

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<Provider>{ui}</Provider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el estado vacio si no hay miembros', async () => {
    vi.mocked(membersService.getAll).mockResolvedValueOnce([]);

    renderWithProviders(<DisciplinesView />);

    expect(screen.getByText('Cargando sanciones...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('No se encontraron miembros.').length).toBeGreaterThan(0);
    });
  });

  it('debe renderizar las sanciones de un miembro existente', async () => {
    vi.mocked(membersService.getAll).mockResolvedValueOnce([member]);
    vi.mocked(disciplinesService.getByMember).mockResolvedValue([discipline]);
    vi.mocked(disciplinesService.getStatus).mockResolvedValueOnce({
      memberId: member.id,
      isSuspended: true,
      activeTotalSuspension: discipline
    });
    vi.mocked(disciplinesService.getStatus).mockResolvedValue({
      memberId: member.id,
      isSuspended: true,
      activeTotalSuspension: discipline
    });

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.getByText('Conducta antideportiva')).toBeInTheDocument();
    });

    expect(screen.getByText('Juan Perez tiene suspension total activa')).toBeInTheDocument();
    expect(screen.getAllByText('Si').length).toBeGreaterThan(0);
    expect(screen.getByText('Activa')).toBeInTheDocument();
    expect(screen.getByText('2026-05-01')).toBeInTheDocument();
  });

  it('debe permitir buscar miembros por nombre o DNI antes de ver el historial', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const otherMember = {
      ...member,
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Maria Rodriguez',
      dni: '87654321'
    } as MemberDTO;

    vi.mocked(membersService.getAll).mockResolvedValueOnce([member, otherMember]);
    vi.mocked(disciplinesService.getByMember).mockResolvedValue([]);
    vi.mocked(disciplinesService.getStatus)
      .mockResolvedValueOnce({ memberId: member.id, isSuspended: true, activeTotalSuspension: discipline })
      .mockResolvedValueOnce({ memberId: otherMember.id, isSuspended: false })
      .mockResolvedValue({ memberId: member.id, isSuspended: true, activeTotalSuspension: discipline });

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.getByText('Maria Rodriguez')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Buscar por nombre o DNI'), '87654321');

    expect(screen.queryByText('Juan Perez')).not.toBeInTheDocument();
    expect(screen.getByText('Maria Rodriguez')).toBeInTheDocument();
    expect(screen.getByText('87654321')).toBeInTheDocument();
  });

  it('debe diferenciar sancion vigente de suspension total activa', async () => {
    const nonTotalDiscipline = {
      ...discipline,
      isTotalSuspension: false
    };

    vi.mocked(membersService.getAll).mockResolvedValueOnce([member]);
    vi.mocked(disciplinesService.getByMember).mockResolvedValue([nonTotalDiscipline]);
    vi.mocked(disciplinesService.getStatus).mockResolvedValue({
      memberId: member.id,
      isSuspended: false
    });

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.getByText('Juan Perez tiene sanciones vigentes, sin suspension total activa')).toBeInTheDocument();
    });

    expect(screen.getByText('Activa')).toBeInTheDocument();
  });

  it('debe permitir crear una nueva sancion mediante el formulario', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(membersService.getAll).mockResolvedValueOnce([member]);
    vi.mocked(disciplinesService.getByMember).mockResolvedValue([]);
    vi.mocked(disciplinesService.getStatus).mockResolvedValue({
      memberId: member.id,
      isSuspended: false
    });
    vi.mocked(disciplinesService.create).mockResolvedValueOnce(discipline);

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando sanciones...')).not.toBeInTheDocument();
    });

    await user.click(screen.getByText(/Agregar Sancion/i));
    await user.type(screen.getByPlaceholderText('Ej. Conducta antideportiva'), 'Conducta antideportiva');

    fireEvent.change(screen.getByLabelText(/Fecha de Inicio/i), { target: { value: '2026-05-01' } });
    fireEvent.change(screen.getByLabelText(/Fecha de Fin/i), { target: { value: '2026-06-01' } });
    await user.click(screen.getByLabelText(/Suspension total/i));
    await user.click(screen.getByText('Crear Sancion'));

    expect(disciplinesService.create).toHaveBeenCalledWith(expect.objectContaining({
      reason: 'Conducta antideportiva',
      startDate: '2026-05-01',
      endDate: '2026-06-01',
      isTotalSuspension: true,
      memberId: member.id
    }));
  });

  it('debe seleccionar el miembro desde el mismo campo de busqueda al crear', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const otherMember = {
      ...member,
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Maria Rodriguez',
      dni: '87654321'
    } as MemberDTO;

    vi.mocked(membersService.getAll).mockResolvedValueOnce([member, otherMember]);
    vi.mocked(disciplinesService.getByMember).mockResolvedValue([]);
    vi.mocked(disciplinesService.getStatus).mockResolvedValue({
      memberId: member.id,
      isSuspended: false
    });
    vi.mocked(disciplinesService.create).mockResolvedValueOnce({
      ...discipline,
      memberId: otherMember.id
    });

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando sanciones...')).not.toBeInTheDocument();
    });

    await user.click(screen.getByText(/Agregar Sancion/i));

    const memberInput = screen.getByPlaceholderText('Buscar miembro por nombre o DNI');
    await user.clear(memberInput);
    await user.type(memberInput, '87654321');
    await user.click(screen.getByText('Maria Rodriguez - 87654321'));

    await user.type(screen.getByPlaceholderText('Ej. Conducta antideportiva'), 'Conducta antideportiva');
    fireEvent.change(screen.getByLabelText(/Fecha de Inicio/i), { target: { value: '2026-05-01' } });
    fireEvent.change(screen.getByLabelText(/Fecha de Fin/i), { target: { value: '2026-06-01' } });
    await user.click(screen.getByText('Crear Sancion'));

    expect(disciplinesService.create).toHaveBeenCalledWith(expect.objectContaining({
      memberId: otherMember.id
    }));
  });

  it('debe mostrar el error del backend si falla la creacion', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(membersService.getAll).mockResolvedValueOnce([member]);
    vi.mocked(disciplinesService.getByMember).mockResolvedValue([]);
    vi.mocked(disciplinesService.getStatus).mockResolvedValue({
      memberId: member.id,
      isSuspended: false
    });
    vi.mocked(disciplinesService.create).mockRejectedValueOnce(new Error('El socio especificado no existe'));

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando sanciones...')).not.toBeInTheDocument();
    });

    await user.click(screen.getByText(/Agregar Sancion/i));
    await user.type(screen.getByPlaceholderText('Ej. Conducta antideportiva'), 'Conducta antideportiva');
    fireEvent.change(screen.getByLabelText(/Fecha de Inicio/i), { target: { value: '2026-05-01' } });
    fireEvent.change(screen.getByLabelText(/Fecha de Fin/i), { target: { value: '2026-06-01' } });
    await user.click(screen.getByText('Crear Sancion'));

    expect(await screen.findByText('El socio especificado no existe')).toBeInTheDocument();
  });

  it('debe permitir eliminar una sancion con confirmacion', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(membersService.getAll).mockResolvedValueOnce([member]);
    vi.mocked(disciplinesService.getByMember).mockResolvedValue([discipline]);
    vi.mocked(disciplinesService.getStatus).mockResolvedValue({
      memberId: member.id,
      isSuspended: true,
      activeTotalSuspension: discipline
    });
    vi.mocked(disciplinesService.delete).mockResolvedValueOnce(undefined);

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.getByText('Conducta antideportiva')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/Eliminar sancion/i));

    expect(confirmSpy).toHaveBeenCalledWith('Estas seguro de que deseas eliminar la sancion "Conducta antideportiva"? Esta accion no se puede deshacer.');
    expect(disciplinesService.delete).toHaveBeenCalledWith(discipline.id);

    confirmSpy.mockRestore();
  });

  it('debe permitir editar una sancion existente', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(membersService.getAll).mockResolvedValueOnce([member]);
    vi.mocked(disciplinesService.getByMember).mockResolvedValue([discipline]);
    vi.mocked(disciplinesService.getStatus).mockResolvedValue({
      memberId: member.id,
      isSuspended: true,
      activeTotalSuspension: discipline
    });
    vi.mocked(disciplinesService.update).mockResolvedValueOnce({
      ...discipline,
      reason: 'Sancion editada'
    });

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.getByText('Conducta antideportiva')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/Editar sancion/i));

    const reasonInput = screen.getByPlaceholderText('Ej. Conducta antideportiva');
    await user.clear(reasonInput);
    await user.type(reasonInput, 'Sancion editada');
    await user.click(screen.getByText('Guardar Cambios'));

    expect(disciplinesService.update).toHaveBeenCalledWith(discipline.id, expect.objectContaining({
      reason: 'Sancion editada'
    }));
  });
});
