import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PostgresMemberRepository } from './infrastructure/member/PostgresMemberRepository.js';
import { MemberValidator } from './domain/member/MemberValidator.js';
import { CreateMemberUseCase } from './application/member/NewMemberUseCase.js';
import { GetMembersUseCase } from './application/member/GetMembersUseCase.js';
import { UpdateMemberUseCase } from './application/member/UpdateMemberUseCase.js';
import { DeleteMemberUseCase } from './application/member/DeleteMemberUseCase.js';
import { MemberController } from './delivery/member/MemberController.js';
import { registerMemberRouter } from './infrastructure/routes/member/MemberRouter.js';
import { PostgresLockerRepository } from './infrastructure/locker/PostgresLockerRepository.js';
import { LockerValidator } from './domain/locker/LockerValidator.js';
import { CreateLockerUseCase } from './application/locker/CreateLockerUseCase.js';
import { LockerController } from './delivery/locker/LockerController.js';
import { registerLockerRouter } from './infrastructure/routes/locker/LockerRouter.js';

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

    const memberController = new MemberController(
        createMemberUseCase, 
        getMembersUseCase,
        updateMemberUseCase,
        deleteMemberUseCase
    );

    const lockerRepo = new PostgresLockerRepository();
    const lockerValidator = new LockerValidator(lockerRepo);
    const createLockerUseCase = new CreateLockerUseCase(lockerRepo, lockerValidator);
    const lockerController = new LockerController(createLockerUseCase);

    registerMemberRouter(server, memberController);
    registerLockerRouter(server, lockerController);

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
