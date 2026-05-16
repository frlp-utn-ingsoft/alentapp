import { LockerDTO, CreateLockerRequest, UpdateLockerRequest } from '@alentapp/shared';

export interface LockerRepository {
  existsByNumber(number: number): Promise<boolean>;
  save(locker: CreateLockerRequest): Promise<LockerDTO>;
  findById(id: string): Promise<LockerDTO | null>;
  findByMemberId(memberId: string): Promise<LockerDTO | null>;
  findAll(): Promise<LockerDTO[]>;
  update(id: string, data: Partial<CreateLockerRequest & { member_id: string | null }>): Promise<LockerDTO>;
  delete(id: string): Promise<void>;
}