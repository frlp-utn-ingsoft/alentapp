import { useEffect, useState } from 'react';
import type { PaymentDTO } from '@alentapp/shared';
import { paymentsService } from '../services/payments';

export function usePayments() {
    const [payments, setPayments] = useState<PaymentDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [paymentToCancel, setPaymentToCancel] = useState<PaymentDTO | null>(
        null,
    );
    const [isCancellingPayment, setIsCancellingPayment] = useState(false);
    const [cancelError, setCancelError] = useState<string | null>(null);

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

    const openCancelPaymentDialog = (payment: PaymentDTO) => {
        setPaymentToCancel(payment);
        setCancelError(null);
    };

    const closeCancelPaymentDialog = () => {
        if (isCancellingPayment) return;

        setPaymentToCancel(null);
        setCancelError(null);
    };

    const cancelPayment = async () => {
        if (!paymentToCancel) return;

        try {
            setIsCancellingPayment(true);
            setCancelError(null);

            await paymentsService.delete(paymentToCancel.id);

            await fetchPayments();

            setPaymentToCancel(null);
        } catch (err: any) {
            setCancelError(
                err.message || 'Ocurrió un error al cancelar el pago.',
            );
        } finally {
            setIsCancellingPayment(false);
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

        paymentToCancel,
        isCancellingPayment,
        cancelError,
        openCancelPaymentDialog,
        closeCancelPaymentDialog,
        cancelPayment,
    };
}