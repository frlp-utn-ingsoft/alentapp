import { EquipmentLoanDTO, CreateEquipmentLoanRequest } from '@alentapp/shared';

// Puerto de Salida. El dominio declara qué necesita; no le importa
// si detrás hay Postgres, MongoDB o un archivo en disco.
export interface IEquipmentLoanRepository {
  create(data: CreateEquipmentLoanRequest): Promise<EquipmentLoanDTO>;
  findById(id: string): Promise<EquipmentLoanDTO | null>;
  findAll(): Promise<EquipmentLoanDTO[]>;
}