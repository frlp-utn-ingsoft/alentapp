// ==========================================
// EquipmentLoan
// ==========================================
export type EquipmentLoanStatus = 'Loaned' | 'Returned' | 'Damaged'; 

export interface CreateEquipmentLoanRequest {
  item_name: string;   
  due_date: string;   
  member_id: string;   
}