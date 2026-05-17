export type PaymentStatus = 'Pending' | 'Paid' | 'Canceled';

export interface PaymentDTO {
    id: string;
    amount: number;
    month: number;
    year: number;
    status: PaymentStatus;
    due_date: string;
    payment_date: string | null;
    member_id: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePaymentRequest {
    member_id: string;
    amount: number;
    month: number;
    year: number;
    due_date: string;
}