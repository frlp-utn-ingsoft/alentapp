import Fastify from 'fastify';
import cors from '@fastify/cors';
import cron from 'node-cron';
import { PostgresMemberRepository } from './infrastructure/PostgresMemberRepository.js';
import { MemberValidator } from './domain/services/MemberValidator.js';
import { CreateMemberUseCase } from './application/NewMemberUseCase.js';
import { GetMembersUseCase } from './application/GetMembersUseCase.js';
import { UpdateMemberUseCase } from './application/UpdateMemberUseCase.js';
import { DeleteMemberUseCase } from './application/DeleteMemberUseCase.js';
import { MemberController } from './delivery/MemberController.js';
import { PostgresPaymentRepository } from './infrastructure/PostgresPaymentRepository.js';
import { SystemClock } from './infrastructure/SystemClock.js';
import { PaymentValidator } from './domain/services/PaymentValidator.js';
import { NewPaymentUseCase } from './application/NewPaymentUseCase.js';
import { GetPaymentsUseCase } from './application/GetPaymentsUseCase.js';
import { MarkPaymentAsPaidUseCase } from './application/MarkPaymentAsPaidUseCase.js';
import { CancelPaymentUseCase } from './application/CancelPaymentUseCase.js';
import { UpdatePaymentUseCase } from './application/UpdatePaymentUseCase.js';
import { CancelExpiredPaymentsJob } from './application/CancelExpiredPaymentsJob.js';
import { PaymentController } from './delivery/PaymentController.js';

export function buildApp() {
    const server = Fastify({
        logger: {
            level: 'info',
            transport: process.env.NODE_ENV === 'development'
                ? {
                    target: 'pino-pretty',
                    options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
                }
                : undefined,
        },
    });

    server.register(cors, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    const clock = new SystemClock();
    const memberRepo = new PostgresMemberRepository();
    const paymentRepo = new PostgresPaymentRepository();
    
    const memberValidator = new MemberValidator(memberRepo);
    const paymentValidator = new PaymentValidator(clock);

    const createMemberUseCase = new CreateMemberUseCase(memberRepo, memberValidator);
    const getMembersUseCase = new GetMembersUseCase(memberRepo);
    const updateMemberUseCase = new UpdateMemberUseCase(memberRepo, memberValidator);
    const deleteMemberUseCase = new DeleteMemberUseCase(memberRepo);
    
    const memberController = new MemberController(
        createMemberUseCase,
        getMembersUseCase,
        updateMemberUseCase,
        deleteMemberUseCase
    );

    const newPaymentUseCase = new NewPaymentUseCase(paymentRepo, memberRepo, paymentValidator, clock);
    const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepo);
    const markPaidUseCase = new MarkPaymentAsPaidUseCase(paymentRepo, clock);
    const cancelUseCase = new CancelPaymentUseCase(paymentRepo, clock);
    const updateUseCase = new UpdatePaymentUseCase(paymentRepo, paymentValidator);
    
    const paymentController = new PaymentController(
        newPaymentUseCase,
        getPaymentsUseCase,
        markPaidUseCase,
        cancelUseCase,
        updateUseCase
    );

    const cancelExpiredJob = new CancelExpiredPaymentsJob(paymentRepo, cancelUseCase, clock);

    server.get('/api/v1/socios', memberController.getAll.bind(memberController));
    server.post('/api/v1/socios', memberController.create.bind(memberController));
    server.put('/api/v1/socios/:id', memberController.update.bind(memberController));
    server.delete('/api/v1/socios/:id', memberController.delete.bind(memberController));

    server.get('/api/v1/payments', paymentController.getAll.bind(paymentController));
    server.post('/api/v1/payments', paymentController.create.bind(paymentController));
    server.patch('/api/v1/payments/:id', paymentController.update.bind(paymentController));
    server.patch('/api/v1/payments/:id/pay', paymentController.pay.bind(paymentController));
    server.patch('/api/v1/payments/:id/cancel', paymentController.cancel.bind(paymentController));

    cron.schedule('0 0 * * *', () => {
        cancelExpiredJob.run().catch(err => server.log.error(err, 'Cron job failed'));
    });

    server.get('/', async () => ({ msg: 'Alentapp API OK' }));

    return server;
}

if (process.argv[1] && process.argv[1].endsWith('app.ts')) {
    const server = buildApp();
    const port = parseInt(process.env.PORT || '3000', 10);
    server.listen({ port, host: '0.0.0.0' }, () =>
        server.log.info(`API server running on http://localhost:${port}`)
    );
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
        process.on(signal, async () => {
            await server.close();
            process.exit(0);
        });
    });
}
