import { LockerDTO, CreateLockerRequest } from '@alentapp/shared';

export interface LockerRepository {
  existsByNumber(number: number): Promise<boolean>;
  save(locker: CreateLockerRequest): Promise<LockerDTO>;
  findById(id: string): Promise<LockerDTO | null>;
  update(id: string, data: Partial<CreateLockerRequest & { member_id: string | null }>): Promise<LockerDTO>;
  delete(id: string): Promise<void>;
  findAll(): Promise<LockerDTO[]>;
}