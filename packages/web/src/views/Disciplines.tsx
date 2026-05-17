import {
  Table,
  Button,
  Heading,
  HStack,
  Stack,
  Text,
  Box,
  Flex,
  Spinner,
  Center,
  Input,
} from "@chakra-ui/react";
import { LuPlus, LuRefreshCw } from "react-icons/lu";
import { useEffect, useState } from "react";
import { disciplinesService } from "../services/disciplines";
import { membersService } from "../services/members";
import type { DisciplineDTO, CreateDisciplineRequest } from "@alentapp/shared";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  DialogCloseTrigger,
} from "../components/ui/dialog";
import { Field } from "../components/ui/field";

export function DisciplinesView() {
  const [disciplines, setDisciplines] = useState<DisciplineDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [memberDni, setMemberDni] = useState("");
  const [memberDniById, setMemberDniById] = useState<Record<string, string>>({});

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateDisciplineRequest>({
    reason: "",
    start_date: "",
    end_date: "",
    is_total_suspension: false,
    member_id: "",
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-AR");
  };

  const fetchDisciplines = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [disciplinesData, membersData] = await Promise.all([
        disciplinesService.getAll(),
        membersService.getAll(),
      ]);

      const dniById = membersData.reduce<Record<string, string>>((acc, member) => {
        acc[member.id] = member.dni;
        return acc;
      }, {});

      setDisciplines(disciplinesData);
      setMemberDniById(dniById);
    } catch (err: any) {
      setError(err.message || "Error al cargar las sanciones");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      reason: "",
      start_date: "",
      end_date: "",
      is_total_suspension: false,
      member_id: "",
    });

    setMemberDni("");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const members = await membersService.getAll();
      const member = members.find((m) => m.dni === memberDni.trim());

      if (!member) {
        throw new Error("No se encontró un socio con ese DNI");
      }

      const disciplineToCreate: CreateDisciplineRequest = {
        ...formData,
        member_id: member.id,
      };

      await disciplinesService.create(disciplineToCreate);

      setIsDialogOpen(false);
      await fetchDisciplines();
    } catch (err: any) {
      alert(err.message || "Error al guardar la sanción");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchDisciplines();
  }, []);

  return (
    <Stack gap="6">
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="2xl" fontWeight="bold">
            Administración de Sanciones
          </Heading>
          <Text color="fg.muted" fontSize="md">
            Gestiona las sanciones disciplinarias de los socios.
          </Text>
        </Box>

        <HStack>
          <Button variant="outline" onClick={fetchDisciplines} disabled={isLoading}>
            <LuRefreshCw /> Actualizar
          </Button>

          <Button colorPalette="blue" size="md" onClick={openCreateModal}>
            <LuPlus /> Agregar Sanción
          </Button>
        </HStack>
      </Flex>

      <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Sanción</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <Stack gap="4">
                <Field label="DNI del Socio" required>
                  <Input
                    placeholder="Ej. 12345678"
                    value={memberDni}
                    onChange={(e) => setMemberDni(e.target.value)}
                    required
                  />
                </Field>

                <Field label="Motivo" required>
                  <Input
                    placeholder="Ej. Conducta indebida"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    required
                  />
                </Field>

                <Field label="Fecha de inicio" required>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    required
                  />
                </Field>

                <Field label="Fecha de fin" required>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    required
                  />
                </Field>

                <Field label="Suspensión total">
                  <HStack>
                    <input
                      type="checkbox"
                      checked={formData.is_total_suspension}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_total_suspension: e.target.checked,
                        })
                      }
                    />
                    <Text>Sí, la sanción implica suspensión total</Text>
                  </HStack>
                </Field>
              </Stack>
            </DialogBody>

            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>

              <Button type="submit" colorPalette="blue" loading={isSubmitting}>
                Crear Sanción
              </Button>
            </DialogFooter>
          </form>

          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      {error && (
        <Box
          p="4"
          bg="red.50"
          color="red.700"
          borderRadius="md"
          borderWidth="1px"
          borderColor="red.200"
        >
          {error}
        </Box>
      )}

      {isLoading ? (
        <Center py="12">
          <Stack align="center" gap="3">
            <Spinner size="xl" color="blue.500" />
            <Text color="fg.muted">Cargando sanciones...</Text>
          </Stack>
        </Center>
      ) : disciplines.length === 0 ? (
        <Center py="12">
          <Stack align="center" gap="3">
            <Text color="fg.muted" fontSize="lg">
              No se encontraron sanciones.
            </Text>
            <Button variant="ghost" onClick={fetchDisciplines}>
              Reintentar
            </Button>
          </Stack>
        </Center>
      ) : (
        <Box
          borderWidth="1px"
          borderRadius="xl"
          overflow="hidden"
          bg="bg.panel"
          boxShadow="sm"
        >
          <Table.Root>
            <Table.Header>
              <Table.Row bg="bg.muted">
                <Table.ColumnHeader py="4">Motivo</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Inicio</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Fin</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Suspensión total</Table.ColumnHeader>
                <Table.ColumnHeader py="4">DNI Socio</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {disciplines.map((discipline) => (
                <Table.Row key={discipline.id} _hover={{ bg: "bg.muted/30" }}>
                  <Table.Cell fontWeight="semibold" color="fg.emphasized">
                    {discipline.reason}
                  </Table.Cell>

                  <Table.Cell color="fg.muted">
                    {formatDate(discipline.start_date)}
                  </Table.Cell>

                  <Table.Cell color="fg.muted">
                    {formatDate(discipline.end_date)}
                  </Table.Cell>

                  <Table.Cell color="fg.muted">
                    {discipline.is_total_suspension === true ? "Sí" : "No"}
                  </Table.Cell>

                  <Table.Cell color="fg.muted">
                    {memberDniById[discipline.member_id] || "Socio no encontrado"}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Stack>
  );
}