import { CreateEnrollmentRequest, EnrollmentDTO } from '@alentapp/shared';

export interface EnrollmentRepository {
  create(data: CreateEnrollmentRequest): Promise<EnrollmentDTO>;
  findAll(): Promise<EnrollmentDTO[]>;
  findById(id: string): Promise<EnrollmentDTO | null>;
  existsBySportId(sportId: string): Promise<boolean>;
  existsByMemberAndSport(memberId: string, sportId: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
