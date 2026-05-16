import { 
  Table, Button, Heading, HStack, Stack, Text, Box, Flex, Spinner, Center, Input
} from "@chakra-ui/react";
import { LuPlus, LuRefreshCw } from "react-icons/lu";
import { useEffect, useState, useMemo } from "react";
import { paymentsService } from "../services/payments";
import { membersService } from "../services/members"; 
import type { PaymentDTO, CreatePaymentRequest, MemberDTO } from "@alentapp/shared";
import { 
  DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogActionTrigger, DialogCloseTrigger
} from "../components/ui/dialog";
import { Field } from "../components/ui/field";
import { 
  SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem, createListCollection 
} from "../components/ui/select";

export function PaymentsView() {
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Solo necesitamos el Request de creación
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    member_id: "",
    amount: "" as unknown as number,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    due_date: "",
  });

  const membersCollection = useMemo(() => createListCollection({
    items: members.map(m => ({ label: `${m.name} (${m.dni})`, value: m.id }))
  }), [members]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [paymentsData, membersData] = await Promise.all([
        paymentsService.getAll(),
        membersService.getAll()
      ]);
      setPayments(paymentsData);
      setMembers(membersData);
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ 
      member_id: "", 
      amount: "" as unknown as number, 
      month: new Date().getMonth() + 1, 
      year: new Date().getFullYear(), 
      due_date: "" 
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Solo creamos el pago, el backend por defecto lo pondrá en 'Pending'
      await paymentsService.create({
        ...formData,
        amount: Number(formData.amount),
        month: Number(formData.month),
        year: Number(formData.year)
      } as CreatePaymentRequest);
      
      setIsDialogOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Error al guardar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMemberName = (id: string) => {
    const member = members.find(m => m.id === id);
    return member ? member.name : "Socio Desconocido";
  };

  return (
    <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
      <Stack gap="8">
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">Administración de Pagos</Heading>
            <Text color="fg.muted" fontSize="md">
              Gestiona las cuotas y estados de cuenta de los socios.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Registrar Pago
            </Button>
          </HStack>
        </Flex>

        {/* Modal Form Solo para Crear */}
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
                    value={formData.member_id ? [formData.member_id]: []}
                    onValueChange={(e) => setFormData({ ...formData, member_id: e.value[0] })}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Ej. Juan Pérez" />
                    </SelectTrigger>
                    <SelectContent>
                      {membersCollection.items.map((item) => (
                        <SelectItem item={item} key={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>

                <HStack gap="4">
                  <Field label="Monto ($)" required>
                    <Input 
                      type="number" min="0" step="0.01"
                      placeholder="Ej. 15000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      required
                    />
                  </Field>
                  <Field label="Vencimiento" required>
                    <Input 
                      type="date" 
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      required
                    />
                  </Field>
                </HStack>

                <HStack gap="4">
                  <Field label="Mes" required>
                    <Input 
                      type="number" min="1" max="12"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                      required
                    />
                  </Field>
                  <Field label="Año" required>
                    <Input 
                      type="number" min="2020" max="2100"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
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

        {error && (
          <Box p="4" bg="red.50" color="red.700" borderRadius="md" borderWidth="1px" borderColor="red.200">
            <Text fontWeight="bold">Error:</Text><Text>{error}</Text>
          </Box>
        )}

        <Box bg="bg.panel" borderRadius="xl" boxShadow="sm" borderWidth="1px" overflow="hidden" minH="300px">
          {isLoading ? (
            <Center h="300px"><Spinner size="xl" color="blue.500" /></Center>
          ) : payments.length === 0 ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Text color="fg.muted">No se encontraron pagos registrados.</Text>
              </Stack>
            </Center>
          ) : (
            <Table.Root size="md" variant="line" interactive>
              <Table.Header>
                <Table.Row bg="bg.muted/50">
                  <Table.ColumnHeader py="4">Socio</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Período</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Monto</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Vencimiento</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Estado</Table.ColumnHeader>
                  {/* Removimos la columna Acciones */}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {payments.map((payment) => (
                  <Table.Row key={payment.id} _hover={{ bg: "bg.muted/30" }}>
                    <Table.Cell fontWeight="semibold">{getMemberName(payment.member_id)}</Table.Cell>
                    <Table.Cell color="fg.muted">{payment.month} / {payment.year}</Table.Cell>
                    <Table.Cell color="fg.emphasized">${payment.amount}</Table.Cell>
                    <Table.Cell color="fg.muted">{payment.due_date}</Table.Cell>
                    <Table.Cell>
                      <Box 
                        display="inline-block" px="2" py="0.5" borderRadius="md" fontSize="xs" fontWeight="bold"
                        bg={payment.status === 'Paid' ? 'green.50' : payment.status === 'Pending' ? 'orange.50' : 'red.50'} 
                        color={payment.status === 'Paid' ? 'green.700' : payment.status === 'Pending' ? 'orange.700' : 'red.700'} 
                      >
                        {payment.status === 'Paid' ? 'Pagado' : payment.status === 'Pending' ? 'Pendiente' : 'Cancelado'}
                      </Box>
                    </Table.Cell>
                    {/* Removimos las celdas de acciones (lápiz y tachito) */}
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