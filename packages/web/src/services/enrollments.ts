import type { CreateEnrollmentRequest, EnrollmentDTO } from '@alentapp/shared';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

export const enrollmentsService = {
  async getAll(): Promise<EnrollmentDTO[]> {
    const response = await fetch(`${API_URL}/inscripciones`);
    if (!response.ok) {
      throw new Error('Error al obtener las inscripciones');
    }
    const result = await response.json();
    return result.data;
  },

  async create(data: CreateEnrollmentRequest): Promise<EnrollmentDTO> {
    const response = await fetch(`${API_URL}/inscripciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear la inscripción');
    }
    const result = await response.json();
    return result.data;
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/inscripciones/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al dar de baja la inscripción');
    }
  },
};
