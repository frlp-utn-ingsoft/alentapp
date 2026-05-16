import { useEffect, useState } from 'react';
import type { PaymentDTO } from '@alentapp/shared';
import { paymentsService } from '../services/payments';

export function usePayments() {
    const [payments, setPayments] = useState<PaymentDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPayments = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await paymentsService.getAll();
            setPayments(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar los pagos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    return {
        payments,
        isLoading,
        error,
        fetchPayments,
    };
}