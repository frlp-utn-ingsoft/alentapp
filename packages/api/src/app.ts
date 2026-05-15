import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PostgresMemberRepository } from './infrastructure/PostgresMemberRepository.js';
import { PostgresSportRepository } from './infrastructure/PostgresSportRepository.js'
import { PostgresPaymentRepository } from './infrastructure/PostgresPaymentRepository.js';
import { MemberValidator } from './domain/services/MemberValidator.js';
import { SportValidator } from './domain/services/SportValidator.js'
import { PaymentValidator } from './domain/services/PaymentValidator.js';
import { CreateMemberUseCase } from './application/NewMemberUseCase.js';
import { CreateSportUseCase } from './application/NewSportUseCase.js';
import { CreatePaymentUseCase } from './application/Payment/NewPaymentUseCase.js';
import { GetMembersUseCase } from './application/GetMembersUseCase.js';
import { GetSportsUseCase } from './application/GetSportsUseCase.js';
import { GetPaymentsUseCase } from './application/Payment/GetPaymentsUseCase.js';
import { UpdateMemberUseCase } from './application/UpdateMemberUseCase.js';
import { DeleteMemberUseCase } from './application/DeleteMemberUseCase.js';
import { MemberController } from './delivery/MemberController.js';
import { SportController } from './delivery/SportController.js';
import { PostgresMedicalCertificateRepository } from './infrastructure/PostgresMedicalCertificateRepository.js';
import { CreateMedicalCertificateUseCase } from './application/NewMedicalCertificateUseCase.js';
import { MedicalCertificateController } from './delivery/MedicalCertificateController.js';


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

    const memberRepo = new PostgresMemberRepository();
    const memberValidator = new MemberValidator(memberRepo);
    
    const createMemberUseCase = new CreateMemberUseCase(memberRepo, memberValidator);
    const getMembersUseCase = new GetMembersUseCase(memberRepo);
    const updateMemberUseCase = new UpdateMemberUseCase(memberRepo, memberValidator);
    const deleteMemberUseCase = new DeleteMemberUseCase(memberRepo);


    const sportRepo = new PostgresSportRepository();
    const sportValidator = new SportValidator(sportRepo);

    const createSportUseCase = new CreateSportUseCase(sportRepo, sportValidator);
    const getSportsUseCase = new GetSportsUseCase(sportRepo);

    const memberController = new MemberController(
        createMemberUseCase, 
        getMembersUseCase,
        updateMemberUseCase,
        deleteMemberUseCase
    );


    const sportController = new SportController(
        createSportUseCase,
        getSportsUseCase
    );

    const medicalCertificateRepo = new PostgresMedicalCertificateRepository();

    const createMedicalCertificateUseCase =
    new CreateMedicalCertificateUseCase(
        medicalCertificateRepo,
        memberRepo
    );

    const medicalCertificateController =
    new MedicalCertificateController(
        createMedicalCertificateUseCase
    );

    //payment
    const paymentRepo = new PostgresPaymentRepository();
    const paymentValidator = new PaymentValidator(paymentRepo);
    const createPaymentUseCase = new CreatePaymentUseCase(paymentRepo, paymentValidator, memberRepo);
    const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepo);
    const paymentController = new PaymentController(createPaymentUseCase, getPaymentsUseCase);

    //Endpoints
    server.get('/api/v1/socios', memberController.getAll.bind(memberController));
    server.post('/api/v1/socios', memberController.create.bind(memberController));
    server.put('/api/v1/socios/:id', memberController.update.bind(memberController));
    server.delete('/api/v1/socios/:id', memberController.delete.bind(memberController));
    server.get('/api/v1/sport', sportController.getAll.bind(sportController));
    server.post('/api/v1/sport', sportController.create.bind(sportController));
    server.get('/api/v1/sport', sportController.getAll.bind(sportController));
    server.post('/api/v1/sport', sportController.create.bind(sportController));
    server.post('/api/v1/medicalcertificate',medicalCertificateController.create.bind(medicalCertificateController));
    
    //Payments Endpoints
    server.get('/api/v1/payments', paymentController.getAll.bind(paymentController));
    server.post('/api/v1/payments', paymentController.create.bind(paymentController));


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
