import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Input,
  Stack,
  Table,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { LuPlus, LuRefreshCw } from "react-icons/lu";
import { useEffect, useMemo, useState } from "react";
import { membersService } from "../services/members";
import { paymentsService } from "../services/payments";
import type { CreatePaymentRequest, MemberDTO, PaymentResponse } from "@alentapp/shared";
import { Field } from "../components/ui/field";
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
  createListCollection,
} from "../components/ui/select";

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export function PaymentsView() {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    amount: 0,
    month: currentMonth,
    year: currentYear,
    dueDate: "",
    memberId: "",
  });

  const memberCollection = useMemo(() => {
    return createListCollection({
      items: members.map((m) => ({ label: `${m.name} - ${m.dni}`, value: m.id })),
    });
  }, [members]);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentsService.getAll();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los pagos");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await membersService.getAll();
      setMembers(data);
    } catch (err: any) {
      console.error("Error loading members", err);
    }
  };

  const openCreateModal = () => {
    fetchMembers();
    setFormData({
      amount: 0,
      month: currentMonth,
      year: currentYear,
      dueDate: "",
      memberId: "",
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    if (!formData.memberId) {
      return "Seleccione un miembro";
    }
    if (!Number.isFinite(formData.amount) || formData.amount <= 0) {
      return "El monto debe ser mayor a cero";
    }
    if (!Number.isInteger(formData.month) || formData.month < 1 || formData.month > 12) {
      return "El mes debe estar entre 1 y 12";
    }
    if (!Number.isInteger(formData.year) || formData.year <= 2000) {
      return "El año ingresado no es válido";
    }
    if (!formData.dueDate) {
      return "Faltan campos requeridos";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await paymentsService.create(formData);
      setIsDialogOpen(false);
      fetchPayments();
    } catch (err: any) {
      setFormError(err.message || "Error al crear el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member ? member.name : memberId;
  };

  useEffect(() => {
    fetchMembers();
    fetchPayments();
  }, []);

  return (
    <Stack gap="8">
      <Flex justify="space-between" align="center">
        <Stack gap="1">
          <Heading size="2xl" fontWeight="bold">Gestión de Pagos</Heading>
          <Text color="fg.muted" fontSize="md">
            Controla las cuotas mensuales de los socios del club.
          </Text>
        </Stack>
        <HStack gap="3">
          <Button variant="outline" onClick={fetchPayments} disabled={isLoading}>
            <LuRefreshCw /> Actualizar
          </Button>
          <Button colorPalette="blue" size="md" onClick={openCreateModal}>
            <LuPlus /> Nuevo Pago
          </Button>
        </HStack>
      </Flex>

      {error && (
        <Box p="4" bg="red.50" color="red.700" borderRadius="md" border="1px solid" borderColor="red.200">
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
              <Text color="fg.muted">No se encontraron pagos.</Text>
              <Button variant="ghost" onClick={fetchPayments}>Reintentar</Button>
            </Stack>
          </Center>
        ) : (
          <Table.Root size="md" variant="line" interactive>
            <Table.Header>
              <Table.Row bg="bg.muted/50">
                <Table.ColumnHeader py="4">Socio</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Monto</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Mes/Año</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Vencimiento</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Estado</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Fecha Pago</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {payments.map((payment) => (
                <Table.Row key={payment.id} _hover={{ bg: "bg.muted/30" }}>
                  <Table.Cell fontWeight="semibold" color="fg.emphasized">
                    {getMemberName(payment.memberId)}
                  </Table.Cell>
                  <Table.Cell color="fg.muted">${payment.amount.toFixed(2)}</Table.Cell>
                  <Table.Cell color="fg.muted">
                    {payment.month}/{payment.year}
                  </Table.Cell>
                  <Table.Cell color="fg.muted">
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Box
                      display="inline-block"
                      px="2"
                      py="0.5"
                      borderRadius="md"
                      bg={
                        payment.status === 'Paid'
                          ? 'green.50'
                          : payment.status === 'Canceled'
                          ? 'red.50'
                          : 'orange.50'
                      }
                      color={
                        payment.status === 'Paid'
                          ? 'green.700'
                          : payment.status === 'Canceled'
                          ? 'red.700'
                          : 'orange.700'
                      }
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      {payment.status === 'Paid' ? 'Pagado' : payment.status === 'Canceled' ? 'Cancelado' : 'Pendiente'}
                    </Box>
                  </Table.Cell>
                  <Table.Cell color="fg.muted">
                    {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Box>

      {isDialogOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
          onClick={() => setIsDialogOpen(false)}
        >
          <Box
            bg="bg.panel"
            borderRadius="xl"
            boxShadow="lg"
            borderWidth="1px"
            p="6"
            maxW="500px"
            w="90%"
            onClick={(e) => e.stopPropagation()}
          >
            <Heading size="lg" mb="4">Nuevo Pago</Heading>
            <form onSubmit={handleSubmit}>
              <Stack gap="4">
                {formError && (
                  <Box p="3" bg="red.50" color="red.700" borderRadius="md" border="1px solid" borderColor="red.200">
                    <Text>{formError}</Text>
                  </Box>
                )}

                <Field label="Socio" required>
                  <SelectRoot
                    collection={memberCollection}
                    value={[formData.memberId]}
                    onValueChange={(e) => setFormData({ ...formData, memberId: e.value[0] })}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Seleccione un socio" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem item={{ label: `${m.name} - ${m.dni}`, value: m.id }} key={m.id}>
                          {m.name} - {m.dni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>

                <Field label="Monto" required>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount || ""}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    required
                  />
                </Field>

                <Flex gap="4">
                  <Field label="Mes" required flex="1">
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                      required
                    />
                  </Field>
                  <Field label="Año" required flex="1">
                    <Input
                      type="number"
                      min="2001"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      required
                    />
                  </Field>
                </Flex>

                <Field label="Vencimiento" required>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </Field>

                <Flex justify="flex-end" gap="3" mt="4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" colorPalette="blue" loading={isSubmitting}>
                    <LuPlus /> Crear Pago
                  </Button>
                </Flex>
              </Stack>
            </form>
          </Box>
        </Box>
      )}
    </Stack>
  );
}