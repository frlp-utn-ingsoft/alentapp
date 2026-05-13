import type { LockerDTO, CreateLockerRequest } from '@alentapp/shared';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

export const lockersService = {
  async create(data: CreateLockerRequest): Promise<LockerDTO> {
    const response = await fetch(`${API_URL}/lockers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al crear el locker');
    }
    return response.json();
  },
};