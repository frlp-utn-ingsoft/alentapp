import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PostgresMemberRepository } from './infrastructure/PostgresMemberRepository.js';
import { MemberValidator } from './domain/services/MemberValidator.js';
import { CreateMemberUseCase } from './application/NewMemberUseCase.js';
import { GetMembersUseCase } from './application/GetMembersUseCase.js';
import { UpdateMemberUseCase } from './application/UpdateMemberUseCase.js';
import { DeleteMemberUseCase } from './application/DeleteMemberUseCase.js';
import { MemberController } from './delivery/MemberController.js';

import { PostgresSportRepository } from './infrastructure/PostgresSportRepository.js';
import { SportValidator } from './domain/services/SportValidator.js';
import { CreateSportUseCase } from './application/CreateSportUseCase.js';
import { GetSportsUseCase } from './application/GetSportsUseCase.js';
import { UpdateSportUseCase } from './application/UpdateSportUseCase.js';
import { DeleteSportUseCase } from './application/DeleteSportUseCase.js';
import { SportController } from './delivery/SportController.js';

import { PostgresEnrollmentRepository } from './infrastructure/PostgresEnrollmentRepository.js';
import { EnrollmentValidator } from './domain/services/EnrollmentValidator.js';
import { CreateEnrollmentUseCase } from './application/CreateEnrollmentUseCase.js';
import { GetEnrollmentsUseCase } from './application/GetEnrollmentsUseCase.js';
import { UpdateEnrollmentUseCase } from './application/UpdateEnrollmentUseCase.js';
import { DeleteEnrollmentUseCase } from './application/DeleteEnrollmentUseCase.js';
import { EnrollmentController } from './delivery/EnrollmentController.js';
import { PostgresPaymentRepository } from './infrastructure/PostgresPaymentRepository.js';
import { PaymentValidator } from './domain/services/PaymentValidator.js';
import { CreatePaymentUseCase } from './application/CreatePaymentUseCase.js';
import { GetPaymentsUseCase } from './application/GetPaymentsUseCase.js';
import { UpdatePaymentUseCase } from './application/UpdatePaymentUseCase.js';
import { CancelPaymentUseCase } from './application/CancelPaymentUseCase.js';
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
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    // ==========================================
    // Members
    // ==========================================
    const memberRepo = new PostgresMemberRepository();
    const memberValidator = new MemberValidator(memberRepo);
    
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

    server.get('/api/v1/socios', memberController.getAll.bind(memberController));
    server.post('/api/v1/socios', memberController.create.bind(memberController));
    server.put('/api/v1/socios/:id', memberController.update.bind(memberController));
    server.delete('/api/v1/socios/:id', memberController.delete.bind(memberController));

    // ==========================================
    // Sports
    // ==========================================
    const sportRepo = new PostgresSportRepository();
    const sportValidator = new SportValidator(sportRepo);

    const createSportUseCase = new CreateSportUseCase(sportRepo, sportValidator);
    const getSportsUseCase = new GetSportsUseCase(sportRepo);
    const updateSportUseCase = new UpdateSportUseCase(sportRepo, sportValidator);
    const deleteSportUseCase = new DeleteSportUseCase(sportRepo);

    const sportController = new SportController(
        createSportUseCase,
        getSportsUseCase,
        updateSportUseCase,
        deleteSportUseCase
    );

    server.get('/api/v1/sports', sportController.getAll.bind(sportController));
    server.post('/api/v1/sports', sportController.create.bind(sportController));
    server.put('/api/v1/sports/:id', sportController.update.bind(sportController));
    server.delete('/api/v1/sports/:id', sportController.delete.bind(sportController));

    // ==========================================
    // Enrollments
    // ==========================================
    const enrollmentRepo = new PostgresEnrollmentRepository();
    const enrollmentValidator = new EnrollmentValidator(enrollmentRepo, memberRepo, sportRepo);

    const createEnrollmentUseCase = new CreateEnrollmentUseCase(enrollmentRepo, enrollmentValidator);
    const getEnrollmentsUseCase = new GetEnrollmentsUseCase(enrollmentRepo);
    const updateEnrollmentUseCase = new UpdateEnrollmentUseCase(enrollmentRepo);
    const deleteEnrollmentUseCase = new DeleteEnrollmentUseCase(enrollmentRepo);

    const enrollmentController = new EnrollmentController(
        createEnrollmentUseCase,
        getEnrollmentsUseCase,
        updateEnrollmentUseCase,
        deleteEnrollmentUseCase
    );

    server.get('/api/v1/enrollments', enrollmentController.getAll.bind(enrollmentController));
    server.post('/api/v1/enrollments', enrollmentController.create.bind(enrollmentController));
    server.put('/api/v1/enrollments/:id', enrollmentController.update.bind(enrollmentController));
    server.delete('/api/v1/enrollments/:id', enrollmentController.delete.bind(enrollmentController));

    // ==========================================
    // Payments
    // ==========================================
    const paymentRepo = new PostgresPaymentRepository();
    const paymentValidator = new PaymentValidator(memberRepo, paymentRepo);
    const createPaymentUseCase = new CreatePaymentUseCase(paymentRepo, paymentValidator);
    const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepo);
    const updatePaymentUseCase = new UpdatePaymentUseCase(paymentRepo, paymentValidator);
    const cancelPaymentUseCase = new CancelPaymentUseCase(paymentRepo, paymentValidator);

    const paymentController = new PaymentController(
        createPaymentUseCase,
        getPaymentsUseCase,
        updatePaymentUseCase,
        cancelPaymentUseCase
    );

    server.post('/api/v1/payment', paymentController.create.bind(paymentController));
    server.get('/api/v1/payment', paymentController.getAll.bind(paymentController));
    server.patch('/api/v1/payment/:id', paymentController.confirm.bind(paymentController));
    server.patch('/api/v1/payment/:id/cancel', paymentController.cancel.bind(paymentController));

    server.get('/', async (req, rep) => {
        rep.status(200).send({ msg: 'asd' })
    });

    return server;
}

// Solo iniciar el servidor si el script se ejecuta directamente (no cuando es importado por vitest)
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