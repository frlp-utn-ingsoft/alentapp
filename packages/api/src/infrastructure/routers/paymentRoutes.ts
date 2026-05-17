import { FastifyInstance } from 'fastify';
import { PostgresMemberRepository } from '../repositories/PostgresMemberRepository.js';
import { PostgresPaymentRepository } from '../repositories/PostgresPaymentRepository.js';
import { CreatePaymentUseCase } from '../../application/useCases/CreatePaymentUseCase.js';
import { GetPaymentByIdUseCase } from '../../application/useCases/GetPaymentByIdUseCase.js';
import { ListPaymentsUseCase } from '../../application/useCases/ListPaymentsUseCase.js';
import { PaymentController } from '../controllers/PaymentController.js';

export async function paymentRoutes(server: FastifyInstance) {
    const memberRepo = new PostgresMemberRepository();
    const paymentRepo = new PostgresPaymentRepository();
    const createPaymentUseCase = new CreatePaymentUseCase(paymentRepo, memberRepo);
    const getPaymentByIdUseCase = new GetPaymentByIdUseCase(paymentRepo);
    const listPaymentsUseCase = new ListPaymentsUseCase(paymentRepo);

    const paymentController = new PaymentController(createPaymentUseCase, getPaymentByIdUseCase, listPaymentsUseCase);

    server.get('/api/v1/payments', paymentController.getAll.bind(paymentController));
    server.get('/api/v1/payments/:id', paymentController.getById.bind(paymentController));
    server.post('/api/v1/payments', paymentController.create.bind(paymentController));
}
