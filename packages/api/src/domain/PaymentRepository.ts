import { PaymentDTO } from '@alentapp/shared';

export interface PaymentRepository {
    /**
     * Persiste un nuevo pago en el sistema.
     * El estado inicial siempre será 'Pending' según las reglas de negocio.
     * Se usa Omit parra indicar que al crear el pago no necesitamos el id (lo genera la DB), ni el status (por defecto es Pending))
     */
    create(payment: Omit<PaymentDTO, 'id' | 'status' | 'payment_date'>): Promise<PaymentDTO>;


    /**
     * Busco un pago por su identificador único
     */
    findById(id: string): Promise<PaymentDTO | null>;

    /**
     * Obtiene todos los pagos registrados (que no estén eliminados)
     */
    findAll(): Promise<PaymentDTO[]>;
}