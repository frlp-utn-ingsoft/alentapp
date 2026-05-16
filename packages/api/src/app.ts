import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';

// Members
import { PostgresMemberRepository } from './infrastructure/PostgresMemberRepository.js';
import { MemberValidator } from './domain/services/MemberValidator.js';
import { CreateMemberUseCase } from './application/NewMemberUseCase.js';
import { GetMembersUseCase } from './application/GetMembersUseCase.js';
import { UpdateMemberUseCase } from './application/UpdateMemberUseCase.js';
import { DeleteMemberUseCase } from './application/DeleteMemberUseCase.js';
import { MemberController } from './delivery/MemberController.js';
// Locker
import { PrismaLockerRepository } from './infrastructure/PrismaLockerRepository.js';
import { CreateLockerUseCase } from './application/CreateLockerUseCase.js';
import { LockerController } from './delivery/LockerController.js';
import { GetLockersUseCase } from './application/GetLockersUseCase.js';

// Payments
import { PostgresPaymentRepository } from './infrastructure/PostgresPaymentRepository.js';
import { CreatePaymentUseCase } from './application/NewPaymentUseCase.js'; 
import { GetPaymentsUseCase } from './application/GetPaymentsUseCase.js';
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

    //Dependencias de Member
    // --- Members ---
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
        deleteMemberUseCase,
    );

    server.get('/api/v1/socios', memberController.getAll.bind(memberController));
    server.post('/api/v1/socios', memberController.create.bind(memberController));
    server.put('/api/v1/socios/:id', memberController.update.bind(memberController));
    server.delete('/api/v1/socios/:id', memberController.delete.bind(memberController));

    //Dependencias de Payment
    const paymentRepo = new PostgresPaymentRepository();

    // Le pasamos el memberRepo que ya instanciamos arriba para no crear dos!
    const createPaymentUseCase = new CreatePaymentUseCase(paymentRepo, memberRepo);
    const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepo);

    const paymentController = new PaymentController(
        createPaymentUseCase,
        getPaymentsUseCase
    );

    // Fijate que acá usamos "server", igual que con socios
    server.get('/api/v1/payments', paymentController.getAll.bind(paymentController));
    server.post('/api/v1/payments', paymentController.create.bind(paymentController));


    // Ruta de prueba
    // --- Lockers ---
    const lockerRepo = new PrismaLockerRepository();
    const createLockerUseCase = new CreateLockerUseCase(lockerRepo);
    const getLockersUseCase = new GetLockersUseCase(lockerRepo);
    const lockerController = new LockerController(createLockerUseCase, getLockersUseCase);

    server.get('/api/v1/lockers', lockerController.getAll.bind(lockerController));
    server.post('/api/v1/lockers', lockerController.create.bind(lockerController));

    server.get('/', async (req, rep) => {
        rep.status(200).send({ msg: 'asd' });
    });

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