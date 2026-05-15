import {
    Table,
    Button,
    Heading,
    HStack,
    IconButton,
    Stack,
    Text,
    Box,
    Flex,
    Spinner,
    Center,
    Input,
} from '@chakra-ui/react';
import { LuPlus, LuPencil, LuTrash2, LuRefreshCw } from 'react-icons/lu';
import { useEffect, useState, ChangeEvent } from 'react';
import { paymentService } from '../services/payments';
import type { PaymentDTO, CreatePaymentRequest } from '@alentapp/shared';
import {
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogActionTrigger,
    DialogCloseTrigger,
} from '../components/ui/dialog';
import { Field } from '../components/ui/field';
import {
    SelectRoot,
    SelectTrigger,
    SelectValueText,
    SelectContent,
    SelectItem,
    createListCollection,
} from '../components/ui/select';

export function PaymentsView() {
    const [payments, setPayments] = useState<PaymentDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the modal
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // funcion  para que el vencimiento por defecto sea 7 dias despues de la fecha actual
    const getDefaultDueDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    };

    const formatDate = (date: string | null) => {
    if (!date) return 'No pagado';

    return new Date(date).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

    // Form state
    const [formData, setFormData] = useState<
        CreatePaymentRequest & { status?: PaymentStatus }
    >({
        member_id: '',
        amount: 0,
        month: 1,
        year: new Date().getFullYear(),
        due_date: getDefaultDueDate(),
    });

    const fetchPayments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await paymentService.getAll();
            setPayments(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar los pagos');
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setFormData({
            member_id: '',
            amount: 0,
            month: 1,
            year: new Date().getFullYear(),
            due_date: getDefaultDueDate(),
            status: 'Pendiente',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await paymentService.create(formData as CreatePaymentRequest);
            setIsDialogOpen(false);
            fetchPayments(); // Refresh the list
        } catch (err: any) {
            alert(err.message || 'Error al guardar el pago');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <DialogRoot
            open={isDialogOpen}
            onOpenChange={(e) => setIsDialogOpen(e.open)}
        >
            <Stack gap="8">
                <Flex justify="space-between" align="center">
                    <Stack gap="1">
                        <Heading size="2xl" fontWeight="bold">
                            Administración de Pagos
                        </Heading>
                        <Text color="fg.muted" fontSize="md">
                            Gestiona los pagos de los integrantes de Alentapp.
                        </Text>
                    </Stack>
                    <HStack gap="3">
                        <Button
                            variant="outline"
                            onClick={fetchPayments}
                            disabled={isLoading}
                        >
                            <LuRefreshCw /> Actualizar
                        </Button>
                        <Button
                            colorPalette="blue"
                            size="md"
                            onClick={openCreateModal}
                        >
                            <LuPlus /> Agregar Pago
                        </Button>
                    </HStack>
                </Flex>

                {/* Modal para agregar/editar pago */}
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{'Agregar Nuevo Pago'}</DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                            <Stack gap="4">
                                <Field label="Id del miembro" required>
                                    <Input
                                        placeholder="Ej. 12345"
                                        value={formData.member_id}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                member_id: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </Field>
                                <Field label="Monto" required>
                                    <Input
                                        type="number"
                                        placeholder="Ej. 1500"
                                        value={formData.amount}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                amount: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </Field>
                                <Field label="Mes" required>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={12}
                                        value={formData.month}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                month: Number(e.target.value),
                                            })
                                        }
                                        required
                                    />
                                </Field>

                                <Field label="Año" required>
                                    <Input
                                        type="number"
                                        value={formData.year}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                year: Number(e.target.value),
                                            })
                                        }
                                        required
                                    />
                                </Field>
                                <Field label="Fecha de Vencimiento" required>
                                    <Input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                due_date: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </Field>
                            </Stack>
                        </DialogBody>
                        <DialogFooter>
                            <DialogActionTrigger asChild>
                                <Button variant="outline">Cancelar</Button>
                            </DialogActionTrigger>
                            <Button
                                type="submit"
                                colorPalette="blue"
                                loading={isSubmitting}
                            >
                                {'Crear Pago'}
                            </Button>
                        </DialogFooter>
                        <DialogCloseTrigger />
                    </form>
                </DialogContent>

                {error && (
                    <Box
                        p="4"
                        bg="red.50"
                        color="red.700"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="red.200"
                    >
                        <Text fontWeight="bold">Error:</Text>
                        <Text>{error}</Text>
                    </Box>
                )}

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
                                <Text color="fg.muted">
                                    Cargando pagos...
                                </Text>
                            </Stack>
                        </Center>
                    ) : payments.length === 0 ? (
                        <Center h="300px">
                            <Stack align="center" gap="4">
                                <Text color="fg.muted">
                                    No se encontraron pagos.
                                </Text>
                                <Button variant="ghost" onClick={fetchPayments}>
                                    Reintentar
                                </Button>
                            </Stack>
                        </Center>
                    ) : (
                        <Table.Root size="md" variant="line" interactive>
                            <Table.Header>
                                <Table.Row bg="bg.muted/50">
                                    <Table.ColumnHeader py="4">
                                        Nombre del socio
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader py="4">
                                        DNI 
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader py="4">
                                        Monto
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader py="4">
                                        Período
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader py="4">
                                        Vencimiento
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader py="4">
                                        Fecha de Pago
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader py="4">
                                        Estado
                                    </Table.ColumnHeader>
{/*                                     
                                    <Table.ColumnHeader py="4" textAlign="end">
                                        Acciones
                                    </Table.ColumnHeader> */}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {payments.map((payment) => (
                                    <Table.Row
                                        key={payment.id}
                                        _hover={{ bg: 'bg.muted/30' }}
                                    >
                                         <Table.Cell
                                            fontWeight="semibold"
                                            color="fg.emphasized"
                                        >
                                            {payment.member?.name || 'N/A'}
                                        </Table.Cell>
                                        
                                         <Table.Cell
                                            fontWeight="semibold"
                                            color="fg.emphasized"
                                        >
                                            {payment.member?.dni || 'N/A'}
                                        </Table.Cell>
                                        <Table.Cell
                                            fontWeight="semibold"
                                            color="fg.emphasized"
                                        >
                                            ${payment.amount}
                                        </Table.Cell>
                                        <Table.Cell color="fg.muted">
                                            {payment.month}/{payment.year}
                                        </Table.Cell>
                                        <Table.Cell color="fg.muted">
                                            {formatDate(payment.due_date)}
                                        </Table.Cell>
                                        <Table.Cell color="fg.muted">
                                            {formatDate(payment.payment_date)}
                                        </Table.Cell>

                                        <Table.Cell>
                                            <Box
                                                display="inline-block"
                                                px="2"
                                                py="0.5"
                                                borderRadius="md"
                                                bg={
                                                    payment.status === 'Pagado'
                                                        ? 'green.50'
                                                        : payment.status ===
                                                            'Vencido'
                                                          ? 'red.50'
                                                          : payment.status ===
                                                              'Cancelado'
                                                            ? 'gray.50'
                                                            : 'orange.50'
                                                }
                                                color={
                                                    payment.status === 'Pagado'
                                                        ? 'green.700'
                                                        : payment.status ===
                                                            'Vencido'
                                                          ? 'red.700'
                                                          : payment.status ===
                                                              'Cancelado'
                                                            ? 'gray.700'
                                                            : 'orange.700'
                                                }
                                                fontSize="xs"
                                                fontWeight="bold"
                                            >
                                                {payment.status}
                                            </Box>
                                        </Table.Cell>
                                        {/* <Table.Cell textAlign="end">
                                            <HStack gap="2" justify="flex-end">
                                                <IconButton
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label="Editar miembro"
                                                    onClick={() =>
                                                        openEditModal(member)
                                                    }
                                                >
                                                    <LuPencil />
                                                </IconButton>
                                                <IconButton
                                                    variant="ghost"
                                                    size="sm"
                                                    colorPalette="red"
                                                    aria-label="Eliminar miembro"
                                                    onClick={() =>
                                                        handleDeleteMember(
                                                            member.id,
                                                            member.name,
                                                        )
                                                    }
                                                >
                                                    <LuTrash2 />
                                                </IconButton>
                                            </HStack>
                                        </Table.Cell> */}
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    )}
                </Box>
            </Stack>
        </DialogRoot>
    );
}
