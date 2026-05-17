import type { CreatePaymentRequest, PaymentDTO, UpdatePaymentRequest } from '@alentapp/shared';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

export const paymentsService = {
    async create(data: CreatePaymentRequest): Promise<PaymentDTO> {
        const response = await fetch(`${API_URL}/pagos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al crear el pago');
        }

        return response.json();
    },

    async getAll(): Promise<PaymentDTO[]> {
        const response = await fetch(`${API_URL}/pagos`);
        if (!response.ok) {
            throw new Error('Error al obtener los pagos');
        }
        const result = await response.json();
        return result.data;
    },

    async update(id: string, data: UpdatePaymentRequest): Promise<PaymentDTO> {
        const response = await fetch(`${API_URL}/pagos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al actualizar el pago');
        }

        return response.json();
    }
};