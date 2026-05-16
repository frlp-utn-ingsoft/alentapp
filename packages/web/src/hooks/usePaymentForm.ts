import { useState } from 'react';
import type {
    CreatePaymentRequest,
    PaymentDTO,
    PaymentStatus,
    UpdatePaymentRequest,
} from '@alentapp/shared';
import { paymentsService } from '../services/payments.js';
import {
    getDefaultDueDate,
    getPreviousMonthAndYear,
} from '../utils/paymentDates.js';
type PaymentFormMode = 'create' | 'update';
export type PaymentFormData = CreatePaymentRequest & {
    status?: PaymentStatus;
    payment_date?: string | null;
};

function getInitialFormData(): PaymentFormData {
    const { month, year } = getPreviousMonthAndYear();
    
    return {
        member_id: '',
        amount: 0,
        month,
        year,
        due_date: getDefaultDueDate(month, year),
        status: 'Pendiente',
        payment_date: null,
    };
}
const toDateInputValue = (date?: string | null): string => {
    if (!date) return '';

    return date.split('T')[0];
};

export function usePaymentForm(onSaved: () => void) {
    const [formMode, setFormMode] = useState<PaymentFormMode>('create');
    const [selectedPayment, setSelectedPayment] = useState<PaymentDTO | null>(
        null,
    );

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] =
        useState<PaymentFormData>(getInitialFormData());

    const openCreateModal = () => {
        setFormMode('create');
        setSelectedPayment(null);
        setFormData(getInitialFormData());
        setIsDialogOpen(true);
    };

    const openUpdateModal = (payment: PaymentDTO) => {
        setFormMode('update');
        setSelectedPayment(payment);
        setFormData({
            member_id: payment.member_id,
            amount: payment.amount,
            month: payment.month,
            year: payment.year,
            due_date: toDateInputValue(payment.due_date),
            status: payment.status,
            payment_date: toDateInputValue(payment.payment_date),
        });
        setIsDialogOpen(true);
    };

    const closePaymentModal = () => {
        setIsDialogOpen(false);
    };

    const updateField = <K extends keyof CreatePaymentRequest>(
        field: K,
        value: CreatePaymentRequest[K],
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const updateMonth = (value: string) => {
        if (value === '') {
            setFormData((prev) => ({
                ...prev,
                month: 0,
                due_date: '',
            }));
            return;
        }

        const newMonth = Number(value);

        setFormData((prev) => ({
            ...prev,
            month: newMonth,
            due_date: getDefaultDueDate(newMonth, prev.year),
        }));
    };

    const updateYear = (value: string) => {
        if (value === '') {
            setFormData((prev) => ({
                ...prev,
                year: 0,
                due_date: '',
            }));
            return;
        }

        const newYear = Number(value);

        setFormData((prev) => ({
            ...prev,
            year: newYear,
            due_date: getDefaultDueDate(prev.month, newYear),
        }));
    };

    const submitPayment = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!formData.member_id) {
            alert('Debe seleccionar un socio válido');
            return;
        }

        setIsSubmitting(true);

        try {
            if (formMode === 'create') {
                const createData: CreatePaymentRequest = {
                    member_id: formData.member_id,
                    amount: formData.amount,
                    month: formData.month,
                    year: formData.year,
                    due_date: formData.due_date,
                };

                await paymentsService.create(createData);
            } else if (formMode === 'update' && selectedPayment) {
                const updateData: UpdatePaymentRequest = {
                    status: formData.status,
                    payment_date:
                        formData.status === 'Pagado'
                            ? formData.payment_date || undefined
                            : undefined,
                };

                await paymentsService.update(selectedPayment.id, updateData);
            }
            closePaymentModal();
            onSaved();
        } catch (err: any) {
            alert(err.message || 'Error al guardar el pago');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        selectedPayment,
        formMode,
        isDialogOpen,
        isSubmitting,
        setIsDialogOpen,
        openCreateModal,
        openUpdateModal,
        closePaymentModal,
        updateField,
        updateMonth,
        updateYear,
        submitPayment,
    };
}
