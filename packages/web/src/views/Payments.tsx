import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Stack,
    Text,
    Heading,
    Flex,
    HStack,
    Spinner,
    Center,
    Table,
    IconButton,
} from '@chakra-ui/react';
import { LuPlus, LuRefreshCw, LuPencil, LuTrash2 } from 'react-icons/lu';
import { membersService } from '../services/members';
import { paymentsService } from '../services/payments';
import type { MemberDTO, PaymentDTO } from '@alentapp/shared';
import { Toaster, toaster } from '../components/ui/toaster';
import { PaymentCreateDialog } from '../components/PaymentCreateDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const PaymentsView = () => {
    const [payments, setPayments] = useState<PaymentDTO[]>([]);
    const [members, setMembers] = useState<MemberDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentDTO | null>(
        null,
    );

    // Estado para el ConfirmDialog
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [paymentToCancel, setPaymentToCancel] = useState<string | null>(null);
    const [isCanceling, setIsCanceling] = useState(false);

    // Abre el diálogo
    const promptCancel = (id: string) => {
        setPaymentToCancel(id);
        setIsConfirmOpen(true);
    };

    // Ejecuta la cancelación tras confirmar
    const handleConfirmCancel = async () => {
        if (!paymentToCancel) return;

        setIsCanceling(true);
        try {
            await paymentsService.update(paymentToCancel, {
                status: 'Canceled',
            });
            toaster.create({
                title: 'Pago cancelado exitosamente',
                type: 'success',
            });
            fetchData();
        } catch (err: any) {
            toaster.create({
                title: 'Error',
                description: err.message,
                type: 'error',
            });
        } finally {
            setIsCanceling(false);
            setPaymentToCancel(null);
            setIsConfirmOpen(false); // Cierra el diálogo al finalizar
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [paymentsData, membersData] = await Promise.all([
                paymentsService.getAll(),
                membersService.getAll(),
            ]);
            setPayments(paymentsData);
            setMembers(membersData);
        } catch (error: any) {
            toaster.create({
                title: 'Error',
                description: error.message,
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getMemberName = (id: string) => {
        const member = members.find((m) => m.id === id);
        return member ? member.name : 'Desconocido';
    };

    const openCreateModal = () => {
        setSelectedPayment(null);
        setIsDialogOpen(true);
    };

    const openEditModal = (payment: PaymentDTO) => {
        setSelectedPayment(payment);
        setIsDialogOpen(true);
    };

    // ELIMINADO: handleDeletePayment (ya no se usa window.confirm)

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Paid':
                return { bg: 'green.50', color: 'green.700', label: 'Pagado' };
            case 'Canceled':
                return { bg: 'red.50', color: 'red.700', label: 'Cancelado' };
            default:
                return {
                    bg: 'orange.50',
                    color: 'orange.700',
                    label: 'Pendiente',
                };
        }
    };

    return (
        <Stack gap="8">
            <Toaster />

            <Flex justify="space-between" align="center">
                <Stack gap="1">
                    <Heading size="2xl" fontWeight="bold">
                        Administración de Pagos
                    </Heading>
                    <Text color="fg.muted" fontSize="md">
                        Gestiona las cuotas y pagos de los socios del club.
                    </Text>
                </Stack>
                <HStack gap="3">
                    <Button
                        variant="outline"
                        onClick={fetchData}
                        disabled={isLoading}
                    >
                        <LuRefreshCw /> Actualizar
                    </Button>
                    <Button
                        colorPalette="blue"
                        size="md"
                        onClick={openCreateModal}
                    >
                        <LuPlus /> Registrar Pago
                    </Button>
                </HStack>
            </Flex>

            <PaymentCreateDialog
                isOpen={isDialogOpen}
                onOpenChange={(e) => setIsDialogOpen(e.open)}
                members={members}
                onSuccess={fetchData}
                payment={selectedPayment}
            />

            {/* AGREGADO: Renderiza el diálogo de confirmación */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onOpenChange={(e) => setIsConfirmOpen(e.open)}
                title="Cancelar pago"
                description="¿Estás seguro de que deseas cancelar este pago? Esta acción no se puede deshacer."
                onConfirm={handleConfirmCancel}
                isConfirmLoading={isCanceling}
                confirmText="Sí, cancelar"
                cancelText="No, volver"
            />

            <Box
                bg="bg.panel"
                borderRadius="xl"
                boxShadow="sm"
                borderWidth="1px"
                overflow="hidden"
                minH="300px"
                position="relative"
            >
                {isLoading ? (
                    <Center h="300px">
                        <Stack align="center" gap="4">
                            <Spinner size="xl" color="blue.500" />
                            <Text color="fg.muted">Cargando pagos...</Text>
                        </Stack>
                    </Center>
                ) : payments.length === 0 ? (
                    <Center h="300px">
                        <Stack align="center" gap="4">
                            <Text color="fg.muted">
                                No se encontraron pagos registrados.
                            </Text>
                            <Button variant="ghost" onClick={fetchData}>
                                Reintentar
                            </Button>
                        </Stack>
                    </Center>
                ) : (
                    <Table.Root size="md" variant="line" interactive>
                        <Table.Header>
                            <Table.Row bg="bg.muted/50">
                                <Table.ColumnHeader py="4">
                                    Socio
                                </Table.ColumnHeader>
                                <Table.ColumnHeader py="4">
                                    Periodo
                                </Table.ColumnHeader>
                                <Table.ColumnHeader py="4">
                                    Monto
                                </Table.ColumnHeader>
                                <Table.ColumnHeader py="4">
                                    Vencimiento
                                </Table.ColumnHeader>
                                <Table.ColumnHeader py="4">
                                    Estado
                                </Table.ColumnHeader>
                                <Table.ColumnHeader py="4" textAlign="end">
                                    Acciones
                                </Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {payments.map((payment) => {
                                const styles = getStatusStyles(payment.status);
                                return (
                                    <Table.Row
                                        key={payment.id}
                                        _hover={{ bg: 'bg.muted/30' }}
                                    >
                                        <Table.Cell
                                            fontWeight="semibold"
                                            color="fg.emphasized"
                                        >
                                            {getMemberName(payment.member_id)}
                                        </Table.Cell>
                                        <Table.Cell color="fg.muted">
                                            {payment.month}/{payment.year}
                                        </Table.Cell>
                                        <Table.Cell color="fg.muted">
                                            ${payment.amount.toLocaleString()}
                                        </Table.Cell>
                                        <Table.Cell color="fg.muted">
                                            {payment.due_date}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Box
                                                display="inline-block"
                                                px="2"
                                                py="0.5"
                                                borderRadius="md"
                                                bg={styles.bg}
                                                color={styles.color}
                                                fontSize="xs"
                                                fontWeight="bold"
                                            >
                                                {styles.label}
                                            </Box>
                                        </Table.Cell>
                                        <Table.Cell textAlign="end">
                                            <HStack gap="2" justify="flex-end">
                                                <IconButton
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label="Editar pago"
                                                    onClick={() =>
                                                        openEditModal(payment)
                                                    }
                                                    disabled={
                                                        payment.status !==
                                                        'Pending'
                                                    }
                                                >
                                                    <LuPencil />
                                                </IconButton>
                                                {/* ✅ MODIFICADO: Ahora llama a promptCancel en lugar de handleDeletePayment */}
                                                <IconButton
                                                    variant="ghost"
                                                    size="sm"
                                                    colorPalette="red"
                                                    aria-label="Cancelar pago"
                                                    onClick={() =>
                                                        promptCancel(payment.id)
                                                    }
                                                    disabled={
                                                        payment.status !==
                                                        'Pending'
                                                    }
                                                >
                                                    <LuTrash2 />
                                                </IconButton>
                                            </HStack>
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table.Root>
                )}
            </Box>
        </Stack>
    );
};
