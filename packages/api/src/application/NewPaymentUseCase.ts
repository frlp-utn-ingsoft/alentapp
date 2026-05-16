import { Payment } from '@alentapp/shared';
import crypto from 'crypto';

export interface PaymentRepository {
  memberExists(memberId: string): Promise<boolean>;
  create(payment: Payment): Promise<Payment>; 
  findByMemberAndPeriod(memberId: string, month: number, year: number): Promise<Payment | null>;
}

export class NewPaymentUseCase {
  constructor(private paymentRepository: PaymentRepository) {}

  public async execute(data: any): Promise<Payment> {
    const { memberId, amount, month, year, dueDate } = data;

    // Validamos la estructura del request
    if (!memberId || !amount || !month || !year || !dueDate) {
      throw new Error("Missing required fields");
    }
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }
    if (month < 1 || month > 12) {
      throw new Error("Month must be between 1 and 12");
    }

    // Acá Validamos que el socio existe
    const exists = await this.paymentRepository.memberExists(memberId); 
    if (!exists) {
      throw new Error(`Member with ID ${memberId} does not exist`);
    }

    // 3. Verificar Duplicados
    const duplicate = await this.paymentRepository.findByMemberAndPeriod(memberId, month, year);
    if (duplicate) {
      throw new Error("DUPLICATE_PERIOD");
    }

    //  Creamos la entidad Payment (Cambiamos el tipo a : any para que no sea tan esticto  con el formato)
    const newPayment: any = {
      id: crypto.randomUUID(),
      // Seteamos ambos mundos para que no falle ni en la validación ni en la persistencia
      memberId,
      member_id: memberId,
      amount,
      month,
      year,
      dueDate: new Date(dueDate),
      due_date: new Date(dueDate),
      status: 'Pending',
      createdAt: new Date(),
      created_at: new Date()
    };

    return await this.paymentRepository.create(newPayment);
  }
}