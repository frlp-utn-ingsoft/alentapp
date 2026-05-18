import { useState } from 'react';
import { Box, Text, Badge, Button, Flex } from '@chakra-ui/react';
import { LuPencil } from 'react-icons/lu';
import { toaster } from './ui/toaster';
import type { PaymentDTO } from '@alentapp/shared';
import { paymentsService } from '../services/payments';

interface PaymentItemProps {
  payment: PaymentDTO;
  onUpdate: (updatedPayment: PaymentDTO) => void;
  onEdit: (payment: PaymentDTO) => void;
}

export function PaymentItem({ payment, onUpdate, onEdit }: PaymentItemProps) {
  const [loadingPay, setLoadingPay] = useState(false);

  const handlePay = async () => {
    setLoadingPay(true);
    try {
      const updated = await paymentsService.pay(payment.id);
      onUpdate(updated);
      toaster.create({
        title: 'Cobro exitoso',
        description: 'La cuota se ha marcado como pagada.',
        type: 'success',
      });
    } catch (error: any) {
      toaster.create({
        title: 'No se pudo cobrar',
        description: error?.message || 'Ocurrió un error inesperado',
        type: 'error',
      });
    } finally {
      setLoadingPay(false);
    }
  };

  const colorPalette =
    payment.status === 'Pagado' ? 'green' :
    payment.status === 'Cancelado' ? 'red' :
    'yellow';

  const isPending = payment.status === 'Pendiente';

  const amountFormatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(payment.amount);

  const dueDateFormatted = new Date(payment.due_date).toLocaleDateString('es-AR');
  const paymentDateFormatted = payment.payment_date
    ? new Date(payment.payment_date).toLocaleDateString('es-AR')
    : null;

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" mb={4} boxShadow="sm">
      <Flex justifyContent="space-between" alignItems="center">
        <Box>
          <Text fontWeight="bold" fontSize="lg">
            Cuota {payment.month}/{payment.year}
          </Text>
          <Text color="gray.500">Monto: {amountFormatted}</Text>
          <Text fontSize="sm" color="gray.400">
            Vencimiento: {dueDateFormatted}
          </Text>
          {paymentDateFormatted && (
            <Text fontSize="sm">Fecha de cobro: {paymentDateFormatted}</Text>
          )}
        </Box>

        <Flex alignItems="center" gap={4}>
          <Badge colorPalette={colorPalette} fontSize="md" p={1} borderRadius="md">
            {payment.status}
          </Badge>

          {isPending && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(payment)}
                disabled={loadingPay}
              >
                <LuPencil /> Editar
              </Button>
              <Button
                colorPalette="green"
                size="sm"
                onClick={handlePay}
                loading={loadingPay}
              >
                Cobrar
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}