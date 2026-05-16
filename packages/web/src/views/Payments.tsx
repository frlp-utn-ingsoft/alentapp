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
    SimpleGrid,
} from '@chakra-ui/react';
import { LuPlus, LuPencil, LuTrash2, LuRefreshCw } from 'react-icons/lu';
import { useEffect, useState, useRef, ChangeEvent } from 'react';

import { paymentsService } from '../services/payments';
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
import { membersService } from '../services/members';
import type { MemberDTO } from '@alentapp/shared';

export function PaymentsView() {
    const [payments, setPayments] = useState<PaymentDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the modal
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for members
    const [memberSearch, setMemberSearch] = useState<MemberDTO[]>([]);
    const [memberResults, setMemberResults] = useState<MemberDTO[]>([]);
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [isSearchingMembers, setIsSearchingMembers] = useState(false);
    const memberSearchRef = useRef<HTMLDivElement | null>(null);

    // funcion que devuelve la fecha de vencimiento por defecto (primer dia del mes siguiente al mes y año seleccionados)
    const getDefaultDueDate = (month: number, year: number) => {
        if (
            !Number.isInteger(month) ||
            !Number.isInteger(year) ||
            month < 1 ||
            month > 12
        ) {
            return '';
        }

        const dueDate = new Date(year, month, 1);

        return dueDate.toISOString().split('T')[0];
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'No pagado';

        return new Date(date).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };
    // Al abrir el modal, se setea el mes y año por defecto al mes anterior al actual (suponiendo que se paga a mes vencido)
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const initialMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const initialYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const [formData, setFormData] = useState<
        CreatePaymentRequest & { status?: PaymentStatus }
    >({
        member_id: '',
        amount: 0,
        month: initialMonth,
        year: initialYear,
        due_date: getDefaultDueDate(initialMonth, initialYear),
    });

    const fetchPayments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await paymentsService.getAll();
            setPayments(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar los pagos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.member_id) {
            alert('Debe seleccionar un socio válido');
            return;
        }
        setIsSubmitting(true);
        try {
            await paymentsService.create(formData as CreatePaymentRequest);
            setIsDialogOpen(false);
            fetchPayments(); // Refresh the list
        } catch (err: any) {
            alert(err.message || 'Error al guardar el pago');
        } finally {
            setIsSubmitting(false);
        }
    };

    const searchMembers = async (query: string) => {
        setMemberSearch(query);
        setSelectedMember(null);
        if (query.trim().length < 2) {
            setMemberResults([]);
            return;
        }
        setIsSearchingMembers(true);
        try {
            const results = await membersService.getAll(query);
            setMemberResults(results);
        } catch (err: any) {
            console.error('Error al buscar miembros:', err);
            setMemberResults([]);
        } finally {
            setIsSearchingMembers(false);
        }
    };

    const handleSelectMember = (member: MemberDTO) => {
        setSelectedMember(member);
        setMemberSearch(`${member.name} (${member.dni})`);
        setFormData({
            ...formData,
            member_id: member.id,
        });
        setMemberResults([]);
    };
    const openCreateModal = () => {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        setFormData({
            member_id: '',
            amount: 0,
            month: currentMonth - 1, // suponiendo que se paga a mes vencido.
            year: currentYear,
            due_date: getDefaultDueDate(currentMonth, currentYear),
            status: 'Pendiente',
        });
        setMemberSearch('');
        setMemberResults([]);
        setSelectedMember(null);

        setIsDialogOpen(true);
    };
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                memberSearchRef.current &&
                !memberSearchRef.current.contains(event.target as Node)
            ) {
                setMemberResults([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
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

                                    <Field label="Socio" required>
                                        <Box
                                            position="relative"
                                            w="100%"
                                            ref={memberSearchRef}
                                        >
                                            <Input
                                                placeholder="Buscar por nombre o DNI"
                                                value={memberSearch}
                                                onChange={(e) =>
                                                    searchMembers(
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />

                                            {memberResults.length > 0 && (
                                                <Box
                                                    position="absolute"
                                                    top="100%"
                                                    left="0"
                                                    right="0"
                                                    zIndex="20"
                                                    bg="white"
                                                    borderWidth="1px"
                                                    borderColor="gray.200"
                                                    borderRadius="md"
                                                    mt="1"
                                                    maxH="220px"
                                                    overflowY="auto"
                                                    boxShadow="lg"
                                                >
                                                    {memberResults.map(
                                                        (member) => (
                                                            <Box
                                                                key={member.id}
                                                                px="4"
                                                                py="3"
                                                                cursor="pointer"
                                                                _hover={{
                                                                    bg: 'gray.50',
                                                                }}
                                                                onMouseDown={() =>
                                                                    handleSelectMember(
                                                                        member,
                                                                    )
                                                                }
                                                            >
                                                                <Text fontWeight="semibold">
                                                                    {
                                                                        member.name
                                                                    }
                                                                </Text>
                                                                <Text
                                                                    fontSize="sm"
                                                                    color="fg.muted"
                                                                >
                                                                    DNI:{' '}
                                                                    {member.dni}
                                                                </Text>
                                                            </Box>
                                                        ),
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    </Field>

                                    <SimpleGrid
                                        columns={{ base: 1, md: 2 }}
                                        gap="4"
                                    >
                                        <Field label="Mes" required>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                value={formData.month}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;

                                                    if (value === '') {
                                                        setFormData({
                                                            ...formData,
                                                            month: 0,
                                                            due_date: '',
                                                        });
                                                        return;
                                                    }

                                                    const newMonth =
                                                        Number(value);

                                                    setFormData({
                                                        ...formData,
                                                        month: newMonth,
                                                        due_date:
                                                            getDefaultDueDate(
                                                                newMonth,
                                                                formData.year,
                                                            ),
                                                    });
                                                }}
                                                required
                                            />
                                        </Field>

                                        <Field label="Año" required>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                value={formData.year}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;

                                                    if (value === '') {
                                                        setFormData({
                                                            ...formData,
                                                            year: 0,
                                                            due_date: '',
                                                        });
                                                        return;
                                                    }

                                                    const newYear =
                                                        Number(value);

                                                    setFormData({
                                                        ...formData,
                                                        year: newYear,
                                                        due_date:
                                                            getDefaultDueDate(
                                                                formData.month,
                                                                newYear,
                                                            ),
                                                    });
                                                }}
                                                required
                                            />
                                        </Field>
                                    </SimpleGrid>
                                    <SimpleGrid
                                        columns={{ base: 1, md: 2 }}
                                        gap="4"
                                    >
                                        <Field label="Monto" required>
                                            <Box position="relative">
                                                <Text
                                                    position="absolute"
                                                    left="3"
                                                    top="50%"
                                                    transform="translateY(-50%)"
                                                    color="fg.muted"
                                                    pointerEvents="none"
                                                >
                                                    $
                                                </Text>

                                                <Input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="0"
                                                    value={formData.amount}
                                                    pl="7"
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            amount: Number(
                                                                e.target.value,
                                                            ),
                                                        })
                                                    }
                                                    required
                                                />
                                            </Box>
                                        </Field>

                                        <Field
                                            label="Fecha de Vencimiento"
                                            required
                                        >
                                            <Input
                                                type="date"
                                                value={formData.due_date}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        due_date:
                                                            e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </Field>
                                    </SimpleGrid>
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
                                <Text color="fg.muted">Cargando pagos...</Text>
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
