import { CreateMedicalCertificateRequest, MedicalCertificateDTO } from '../types/MedicalCertificate.js';
import { MedicalCertificateRepository } from '../domain/services/medicalCertificateRepository.js';
import { MemberRepository } from '../../domain/MemberRepository.js';

export class CreateMedicalCertificateUseCase {
  constructor(
    private readonly medicalCertificateRepo: MedicalCertificateRepository,
    private readonly memberRepo: MemberRepository
  ) {}

  async execute(request: CreateMedicalCertificateRequest): Promise<MedicalCertificateDTO> {
    //Validar matrícula médica 
    if (!request.doctor_license || request.doctor_license.trim() === '') {
      throw new Error('La matrícula del médico es obligatoria');
    }

    //Validar consistencia de fechas 
    const issueDate = new Date(request.issue_date);
    const expiryDate = new Date(request.expiry_date);
    if (expiryDate <= issueDate) {
      throw new Error('La fecha de vencimiento debe ser posterior a la de emisión');
    }

    //Validar que el socio exista 
    const member = await this.memberRepo.findById(request.member_id);
    if (!member) {
      throw new Error('El socio indicado no se encuentra registrado');
    }

    //Buscar si el socio ya tiene un certificado activo e invalidarlo
    const activeCertificate = await this.medicalCertificateRepo.findActiveByMemberId(request.member_id);
    if (activeCertificate) {
      await this.medicalCertificateRepo.invalidate(activeCertificate.id);
    }

    //Crear y guardar el nuevo certificado
    const newCertificateData = {
      member_id: request.member_id,
      issue_date: request.issue_date,
      expiry_date: request.expiry_date,
      doctor_license: request.doctor_license,
      is_validated: true
    };

    const createdCertificate = await this.medicalCertificateRepo.create(newCertificateData);

    return createdCertificate;
  }
}
