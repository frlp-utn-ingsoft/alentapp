// packages/api/src/delivery/PaymentController.test.ts

import { PaymentController } from './PaymentController.js';
import { CreatePaymentDTO, Payment } from '@alentapp/shared';

// Le avisamos a TypeScript que estas funciones existen globalmente en el entorno de Jest
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;
declare const jest: any;

describe('PaymentController', () => {
  let mockUseCase: any;
  let paymentController: PaymentController;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    // Creamos un Mock del Caso de Uso para no tocar la Base de Datos real en el test unitario
    mockUseCase = {
      execute: jest.fn()
    };

    paymentController = new PaymentController(mockUseCase);

    // Mockeamos el objeto Res de Express para verificar los estados HTTP (201, 400)
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should create a payment successfully and return 201', async () => {
    const mockDTO: CreatePaymentDTO = {
      member_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      amount: 1500,
      month: 5,
      year: 2026,
      due_date: '2026-05-30'
    };

    const mockCreatedPayment: Payment = {
      id: 'pago-uuid-123',
      ...mockDTO,
      due_date: new Date(mockDTO.due_date),
      status: 'Pending',
      payment_date: null
    };

    // Forzamos al caso de uso simulado a retornar el pago exitoso
    (mockUseCase.execute as any).mockResolvedValue(mockCreatedPayment);

    mockRequest = { body: mockDTO };

    await paymentController.create(mockRequest, mockResponse);

    // Verificaciones finales
    expect(mockUseCase.execute).toHaveBeenCalledWith(mockDTO);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedPayment);
  });

  it('should return 400 if the use case throws an error', async () => {
    const mockInvalidDTO = { amount: -50 }; // Datos inválidos
    mockRequest = { body: mockInvalidDTO };

    // Forzamos al caso de uso simulado a lanzar una excepción de negocio
    (mockUseCase.execute as any).mockRejectedValue(new Error('Amount must be greater than zero'));

    await paymentController.create(mockRequest, mockResponse);

    // Verificaciones de error
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Amount must be greater than zero' });
  });
});