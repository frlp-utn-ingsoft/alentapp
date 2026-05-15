
import { MedicalCertificateDTO } from '../../types/MedicalCertificate.js';


export interface MedicalCertificateRepository {
  // Lista todos los certificados registrados
  findAll(): Promise<MedicalCertificateDTO[]>;

  // Guarda un nuevo certificado (is_validated en true por defecto)
  create(certificate: Omit<MedicalCertificateDTO, 'id'>): Promise<MedicalCertificateDTO>;
  
  // Busca si el socio ya tiene un certificado vigente
  findActiveByMemberId(memberId: string): Promise<MedicalCertificateDTO | null>;
  
  // Invalida un certificado específico)
  invalidate(id: string): Promise<void>;
}
