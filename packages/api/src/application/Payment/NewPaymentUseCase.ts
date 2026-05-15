import { PaymentRepository
 } from "../../domain/PaymentRepository.js";
import { PaymentDTO, CreatePaymentRequest } from "@alentapp/shared";

export class NewPaymentUseCase {
    constructor(
        private readonly paymentRepository: PaymentRepository
    ) {} 
    
    async execute(data: CreatePaymentRequest): Promise<PaymentDTO> {
        
        const newPayment = await this.paymentRepository.create({
            ...data,
            due_date: new Date(data.due_date),
            status: 'Pendiente', // Regla de negocio: todos los pagos nuevos son Pendientes

        });
        return newPayment;  
    }
}