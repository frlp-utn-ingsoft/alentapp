import { useState } from 'react';
import type { CreatePaymentRequest } from '@alentapp/shared';
import { paymentsService } from '../services/payments';
import {
    getDefaultDueDate,
    getPreviousMonthAndYear,
} from '../utils/paymentDates';

function getInitialFormData(): CreatePaymentRequest {
    const { month, year } = getPreviousMonthAndYear();

    return {
        member_id: '',
        amount: 0,
        month,
        year,
        due_date: getDefaultDueDate(month, year),
    };
}

export function useCreatePaymentForm(onCreated: () => void) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreatePaymentRequest>(
        getInitialFormData(),
    );

    const openCreateModal = () => {
        setFormData(getInitialFormData());
        setIsDialogOpen(true);
    };

    const closeCreateModal = () => {
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
            await paymentsService.create(formData);
            closeCreateModal();
            onCreated();
        } catch (err: any) {
            alert(err.message || 'Error al guardar el pago');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        isDialogOpen,
        isSubmitting,
        setIsDialogOpen,
        openCreateModal,
        closeCreateModal,
        updateField,
        updateMonth,
        updateYear,
        submitPayment,
    };
}