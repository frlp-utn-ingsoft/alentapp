import { CreateEquipmentLoanRequest, EquipmentLoanStatus } from '@alentapp/shared';

// El objeto que se debe cumplir con el puerto de salida del dominio
export interface EquipmentLoanEntity {
    id: string;
    item_name: string;
    status: EquipmentLoanStatus;
    loan_date: string; // ISO string
    due_date: string;  // ISO string
    member_id: string;
}

export interface EquipmentLoanRepository {
    create(loan: CreateEquipmentLoanRequest & { status: EquipmentLoanStatus }): Promise<EquipmentLoanEntity>;
}