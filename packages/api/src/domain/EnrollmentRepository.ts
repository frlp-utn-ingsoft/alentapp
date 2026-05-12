export interface EnrollmentRepository {
  existsBySportId(sportId: string): Promise<boolean>;
}
