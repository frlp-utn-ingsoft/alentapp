import { 
  Button, 
  Heading, 
  HStack, 
  Stack, 
  Text, 
  Box,
  Flex,
  Input
} from "@chakra-ui/react";
import { LuPlus, LuRefreshCw } from "react-icons/lu";
import { useEffect, useState } from "react";
import { membersService } from "../services/members";
import { paymentsService } from "../services/payments";
import type { MemberDTO, CreatePaymentRequest } from "@alentapp/shared";
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
  const [members, setMembers] = useState<MemberDTO[]>([]);
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
      alert("Pago registrado con éxito");
      // Aquí dispararíamos el refresh de la tabla en el paso 12
    } catch (err: any) {
      alert(err.message || "Error al registrar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

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
            p="10"
            textAlign="center"
        >
            <Text color="fg.muted">Selecciona "Registrar Pago" para iniciar.</Text>
        </Box>
      </Stack>
    </DialogRoot>
  );
}
