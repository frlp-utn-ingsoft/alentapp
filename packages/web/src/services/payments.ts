import type { PaymentDTO, CreatePaymentRequest, UpdatePaymentRequest } from '@alentapp/shared';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

export const paymentsService = {
  async getAll(): Promise<PaymentDTO[]> {
    const response = await fetch(`${API_URL}/payment`);
    if (!response.ok) {
      throw new Error('Error al obtener los pagos');
    }
    const result = await response.json();
    return result.data;
  },

  async create(data: CreatePaymentRequest): Promise<PaymentDTO> {
    const response = await fetch(`${API_URL}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al registrar el pago');
    }
    const result = await response.json();
    return result.data;
  },

  async confirm(id: string, data: UpdatePaymentRequest): Promise<PaymentDTO> {
    const response = await fetch(`${API_URL}/payment/${id}/confirm`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al confirmar el pago');
    }
    const result = await response.json();
    return result.data;
  },

  async cancel(id: string): Promise<PaymentDTO> {
    const response = await fetch(`${API_URL}/payment/${id}/cancel`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al cancelar el pago');
    }
    const result = await response.json();
    return result.data;
  },
};
