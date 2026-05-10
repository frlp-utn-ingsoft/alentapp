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
  Input,
  Center,
  Spinner
} from "@chakra-ui/react";
import { LuPlus, LuCheck, LuX, LuRefreshCw } from "react-icons/lu";
import { useEffect, useState } from "react";
import { membersService } from "../services/members";
import { paymentsService } from "../services/payments";
import type { MemberDTO, PaymentDTO, CreatePaymentRequest } from "@alentapp/shared";
import { 
  DialogRoot, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogBody, 
  DialogFooter, 
  DialogActionTrigger,
  DialogCloseTrigger
} from "../components/ui/dialog";
import { Field } from "../components/ui/field";
import { 
  SelectRoot, 
  SelectTrigger, 
  SelectValueText, 
  SelectContent, 
  SelectItem, 
  createListCollection 
} from "../components/ui/select";

export function PaymentsView() {
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  
  // State for the modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    due_date: new Date().toISOString().split('T')[0],
    member_id: "",
  });

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const data = await paymentsService.getAll();
      setPayments(data);
    } catch (err: any) {
      console.error("Error al cargar los pagos", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const data = await membersService.getAll();
      setMembers(data);
    } catch (err: any) {
      console.error("Error al cargar los miembros", err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const membersCollection = createListCollection({
    items: members.map(m => ({ label: `${m.name} (DNI: ${m.dni})`, value: m.id })),
  });

  const monthsCollection = createListCollection({
    items: [
        { label: "Enero", value: "1" },
        { label: "Febrero", value: "2" },
        { label: "Marzo", value: "3" },
        { label: "Abril", value: "4" },
        { label: "Mayo", value: "5" },
        { label: "Junio", value: "6" },
        { label: "Julio", value: "7" },
        { label: "Agosto", value: "8" },
        { label: "Septiembre", value: "9" },
        { label: "Octubre", value: "10" },
        { label: "Noviembre", value: "11" },
        { label: "Diciembre", value: "12" },
    ],
  });

  const openCreateModal = () => {
    setFormData({ 
        amount: 0, 
        month: new Date().getMonth() + 1, 
        year: new Date().getFullYear(), 
        due_date: new Date().toISOString().split('T')[0], 
        member_id: "" 
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.member_id) {
        alert("Debe seleccionar un socio");
        return;
    }
    setIsSubmitting(true);
    try {
      await paymentsService.create(formData);
      setIsDialogOpen(false);
      fetchPayments();
    } catch (err: any) {
      alert(err.message || "Error al registrar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayment = async (id: string) => {
    if (window.confirm("¿Confirmar que el pago ha sido recibido?")) {
        try {
            await paymentsService.confirm(id, {
                status: 'Paid',
                payment_date: new Date().toISOString(),
            });
            fetchPayments();
        } catch (err: any) {
            alert(err.message || "Error al confirmar el pago");
        }
    }
  };

  const handleCancelPayment = async (id: string) => {
    if (window.confirm("¿Estás seguro de cancelar este pago? Esta acción es irreversible.")) {
        try {
            await paymentsService.cancel(id);
            fetchPayments();
        } catch (err: any) {
            alert(err.message || "Error al cancelar el pago");
        }
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchMembers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'Paid': return 'green';
        case 'Canceled': return 'red';
        default: return 'orange';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
        case 'Paid': return 'Pagado';
        case 'Canceled': return 'Cancelado';
        default: return 'Pendiente';
    }
  };

  return (
    <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
      <Stack gap="8">
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">Gestión de Pagos</Heading>
            <Text color="fg.muted" fontSize="md">
              Registra y administra los pagos mensuales de los socios.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={fetchPayments} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Registrar Pago
            </Button>
          </HStack>
        </Flex>

        {/* Modal para registrar pago */}
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Pago</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="Socio" required>
                  <SelectRoot 
                    collection={membersCollection} 
                    value={[formData.member_id]}
                    onValueChange={(e) => setFormData({ ...formData, member_id: e.value[0] })}
                    disabled={isLoadingMembers}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Seleccione un socio" />
                    </SelectTrigger>
                    <SelectContent portalRef={null}>
                      {membersCollection.items.map((m) => (
                        <SelectItem item={m} key={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>

                <HStack gap="4" width="full">
                    <Field label="Monto ($)" required>
                        <Input 
                            type="number"
                            placeholder="0.00" 
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            required
                        />
                    </Field>
                    <Field label="Fecha de Vencimiento" required>
                        <Input 
                            type="date" 
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            required
                        />
                    </Field>
                </HStack>

                <HStack gap="4" width="full">
                    <Field label="Mes" required>
                        <SelectRoot 
                            collection={monthsCollection} 
                            value={[formData.month.toString()]}
                            onValueChange={(e) => setFormData({ ...formData, month: parseInt(e.value[0]) })}
                        >
                            <SelectTrigger>
                            <SelectValueText placeholder="Mes" />
                            </SelectTrigger>
                            <SelectContent portalRef={null}>
                            {monthsCollection.items.map((m) => (
                                <SelectItem item={m} key={m.value}>
                                {m.label}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </SelectRoot>
                    </Field>
                    <Field label="Año" required>
                        <Input 
                            type="number"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                            required
                        />
                    </Field>
                </HStack>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>
              <Button type="submit" colorPalette="blue" loading={isSubmitting}>
                Registrar Pago
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </form>
        </DialogContent>

        <Box 
            bg="bg.panel" 
            borderRadius="xl" 
            boxShadow="sm" 
            borderWidth="1px" 
            overflow="hidden"
            minH="300px"
        >
            {isLoading ? (
                <Center h="300px">
                    <Spinner size="xl" color="blue.500" />
                </Center>
            ) : payments.length === 0 ? (
                <Center h="300px">
                    <Text color="fg.muted">No hay pagos registrados.</Text>
                </Center>
            ) : (
                <Table.Root size="md" variant="line">
                    <Table.Header bg="bg.muted/50">
                        <Table.Row>
                            <Table.ColumnHeader py="4">Socio</Table.ColumnHeader>
                            <Table.ColumnHeader py="4">Monto</Table.ColumnHeader>
                            <Table.ColumnHeader py="4">Periodo</Table.ColumnHeader>
                            <Table.ColumnHeader py="4">Vencimiento</Table.ColumnHeader>
                            <Table.ColumnHeader py="4">Estado</Table.ColumnHeader>
                            <Table.ColumnHeader py="4" textAlign="end">Acciones</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {payments.map((p) => (
                            <Table.Row key={p.id}>
                                <Table.Cell fontWeight="semibold">{p.member_name}</Table.Cell>
                                <Table.Cell>${p.amount.toLocaleString()}</Table.Cell>
                                <Table.Cell>{p.month}/{p.year}</Table.Cell>
                                <Table.Cell>{p.due_date}</Table.Cell>
                                <Table.Cell>
                                    <Box 
                                        display="inline-block" 
                                        px="2" py="0.5" 
                                        borderRadius="md" 
                                        bg={`${getStatusColor(p.status)}.50`} 
                                        color={`${getStatusColor(p.status)}.700`} 
                                        fontSize="xs" fontWeight="bold"
                                    >
                                        {getStatusLabel(p.status)}
                                    </Box>
                                </Table.Cell>
                                <Table.Cell textAlign="end">
                                    {p.status === 'Pending' && (
                                        <HStack gap="2" justify="flex-end">
                                            <IconButton 
                                                size="sm" 
                                                variant="ghost" 
                                                colorPalette="green" 
                                                aria-label="Confirmar pago"
                                                onClick={() => handleConfirmPayment(p.id)}
                                            >
                                                <LuCheck />
                                            </IconButton>
                                            <IconButton 
                                                size="sm" 
                                                variant="ghost" 
                                                colorPalette="red" 
                                                aria-label="Cancelar pago"
                                                onClick={() => handleCancelPayment(p.id)}
                                            >
                                                <LuX />
                                            </IconButton>
                                        </HStack>
                                    )}
                                </Table.Cell>
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
