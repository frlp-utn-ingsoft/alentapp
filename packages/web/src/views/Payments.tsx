import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Input,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { LuPlus, LuRefreshCw, LuSearch } from "react-icons/lu";
import { useEffect, useMemo, useState } from "react";
import { membersService } from "../services/members";
import { paymentsService } from "../services/payments";
import type { CreatePaymentRequest, MemberDTO, PaymentResponse } from "@alentapp/shared";
import { Field } from "../components/ui/field";

const formatMemberLabel = (member: MemberDTO) => `${member.name} - ${member.dni}`;

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export function PaymentsView() {
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdPayment, setCreatedPayment] = useState<PaymentResponse | null>(null);
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    amount: 0,
    month: currentMonth,
    year: currentYear,
    dueDate: "",
    memberId: "",
  });

  const filteredMembers = useMemo(() => {
    const search = memberSearch.trim().toLowerCase();

    if (!search) {
      return members;
    }

    return members.filter((member) =>
      member.name.toLowerCase().includes(search) ||
      member.dni.toLowerCase().includes(search)
    );
  }, [memberSearch, members]);

  const selectedMember = members.find((member) => member.id === formData.memberId);

  const fetchMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await membersService.getAll();
      setMembers(data);
      setFormData((current) => ({
        ...current,
        memberId: current.memberId || data[0]?.id || "",
      }));
    } catch (err: any) {
      setError(err.message || "Error al cargar los miembros");
    } finally {
      setIsLoading(false);
    }
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const payment = await paymentsService.create(formData);
      setCreatedPayment(payment);
      setFormData((current) => ({
        ...current,
        amount: 0,
        dueDate: "",
      }));
    } catch (err: any) {
      setFormError(err.message || "Error al crear el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <Stack gap="8">
      <Flex justify="space-between" align="center">
        <Stack gap="1">
          <Heading size="2xl" fontWeight="bold">Alta de Pagos</Heading>
          <Text color="fg.muted" fontSize="md">
            Registra cuotas mensuales con estado inicial pendiente.
          </Text>
        </Stack>
        <Button variant="outline" onClick={fetchMembers} disabled={isLoading}>
          <LuRefreshCw /> Actualizar
        </Button>
      </Flex>

      {error && (
        <Box p="4" bg="red.50" color="red.700" borderRadius="md" border="1px solid" borderColor="red.200">
          <Text>{error}</Text>
        </Box>
      )}

      <Box bg="bg.panel" borderRadius="xl" boxShadow="sm" borderWidth="1px" p="6">
        <form onSubmit={handleSubmit}>
          <Stack gap="5">
            {formError && (
              <Box p="3" bg="red.50" color="red.700" borderRadius="md" border="1px solid" borderColor="red.200">
                <Text>{formError}</Text>
              </Box>
            )}

            <Field label="Buscar miembro">
              <Input
                placeholder="Buscar por nombre o DNI"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
              />
            </Field>

            <Box borderWidth="1px" borderColor="border.muted" borderRadius="md" overflow="hidden">
              {isLoading ? (
                <Center h="96px">
                  <Text color="fg.muted">Cargando miembros...</Text>
                </Center>
              ) : filteredMembers.length === 0 ? (
                <Center h="96px">
                  <Text color="fg.muted">No hay miembros para esa busqueda.</Text>
                </Center>
              ) : (
                <Table.Root size="sm" variant="line" interactive>
                  <Table.Header>
                    <Table.Row bg="bg.muted/50">
                      <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                      <Table.ColumnHeader>DNI</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">Seleccion</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredMembers.map((member) => {
                      const isSelected = member.id === formData.memberId;

                      return (
                        <Table.Row
                          key={member.id}
                          bg={isSelected ? "bg.muted" : undefined}
                          boxShadow={isSelected ? "inset 3px 0 0 var(--chakra-colors-blue-500)" : undefined}
                        >
                          <Table.Cell fontWeight="semibold">{member.name}</Table.Cell>
                          <Table.Cell color="fg.muted">{member.dni}</Table.Cell>
                          <Table.Cell textAlign="end">
                            <Button
                              type="button"
                              size="sm"
                              variant={isSelected ? "solid" : "outline"}
                              colorPalette={isSelected ? "blue" : undefined}
                              onClick={() => setFormData((current) => ({ ...current, memberId: member.id }))}
                            >
                              <LuSearch /> {isSelected ? "Seleccionado" : "Elegir"}
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              )}
            </Box>

            {selectedMember && (
              <Text color="fg.muted" fontSize="sm">
                Miembro seleccionado: {formatMemberLabel(selectedMember)}
              </Text>
            )}

            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", md: "repeat(4, minmax(0, 1fr))" }}
              gap="4"
            >
              <Field label="Monto" required>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount || ""}
                  onChange={(event) => setFormData({ ...formData, amount: Number(event.target.value) })}
                  required
                />
              </Field>
              <Field label="Mes" required>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.month}
                  onChange={(event) => setFormData({ ...formData, month: Number(event.target.value) })}
                  required
                />
              </Field>
              <Field label="Año" required>
                <Input
                  type="number"
                  min="2001"
                  value={formData.year}
                  onChange={(event) => setFormData({ ...formData, year: Number(event.target.value) })}
                  required
                />
              </Field>
              <Field label="Vencimiento" required>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(event) => setFormData({ ...formData, dueDate: event.target.value })}
                  required
                />
              </Field>
            </Box>

            <Flex justify="flex-end">
              <Button type="submit" colorPalette="blue" loading={isSubmitting} disabled={isLoading || !formData.memberId}>
                <LuPlus /> Crear Pago
              </Button>
            </Flex>
          </Stack>
        </form>
      </Box>

      {createdPayment && (
        <Box p="4" bg="green.50" color="green.700" borderRadius="md" border="1px solid" borderColor="green.200">
          <Stack gap="1">
            <Text fontWeight="bold">Pago creado correctamente</Text>
            <Text fontSize="sm">
              ID {createdPayment.id} - ${createdPayment.amount} - {createdPayment.month}/{createdPayment.year} - Estado {createdPayment.status}
            </Text>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
