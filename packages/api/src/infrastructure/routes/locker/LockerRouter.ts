import { FastifyInstance } from 'fastify';
import { LockerController } from '../../../delivery/locker/LockerController.js';

export function registerLockerRouter(
    server: FastifyInstance,
    lockerController: LockerController,
): void {
    server.post('/api/v1/lockers', lockerController.create.bind(lockerController));
}
