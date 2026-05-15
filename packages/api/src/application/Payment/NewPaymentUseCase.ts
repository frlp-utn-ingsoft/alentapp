import { PaymentRepository
 } from "../../domain/PaymentRepository.js";
import { PaymentDTO, CreatePaymentRequest } from "@alentapp/shared";
import { PaymentValidator } from "../../domain/services/PaymentValidator.js";

export class NewPaymentUseCase {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly paymentValidator: PaymentValidator
    ) {} 
    
    async execute(data: CreatePaymentRequest): Promise<PaymentDTO> {
        //validaciones
        this.paymentValidator.validateAmount(data.amount);
        this.paymentValidator.validateMonth(data.month);
        this.paymentValidator.validateYear(data.year);
        this.paymentValidator.validateDueDate(data.due_date);

        await this.paymentValidator.validateUniquePayment(data.member_id, data.month, data.year);

        //persistencia
        const newPayment = await this.paymentRepository.create({
            ...data,
            due_date: new Date(data.due_date),
            status: 'Pendiente', // Regla de negocio: todos los pagos nuevos son Pendientes

        });
        return newPayment;  
    }
}