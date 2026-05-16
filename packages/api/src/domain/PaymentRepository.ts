import { PaymentDTO } from '@alentapp/shared';

// Puerto de salida: el dominio no sabe si usamos Postgres, Mongo, etc.
export interface IPaymentRepository {
    save(data: Omit<PaymentDTO, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentDTO>;
    findAll(): Promise<PaymentDTO[]>;
}
