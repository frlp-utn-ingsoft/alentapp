import type { LockerDTO } from '@alentapp/shared';

const API_URL =
    (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

export const lockersService = {
    async getAll(): Promise<LockerDTO[]> {
        const response = await fetch(`${API_URL}/lockers`);
        if (!response.ok) {
            throw new Error('Error al obtener los lockers');
        }
        const result = await response.json();
        return result.data;
    },
};