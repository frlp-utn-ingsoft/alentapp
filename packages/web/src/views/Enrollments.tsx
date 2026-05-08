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
} from "@chakra-ui/react";
import { LuPlus, LuTrash2, LuRefreshCw, LuPower, LuPowerOff } from "react-icons/lu";
import { useEffect, useState } from "react";
import { enrollmentsService } from "../services/enrollments";
import { membersService } from "../services/members";
import { sportsService } from "../services/sports";
import type { EnrollmentDTO, CreateEnrollmentRequest, MemberDTO, SportDTO } from "@alentapp/shared";
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

export function EnrollmentsView() {
  const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [sports, setSports] = useState<SportDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateEnrollmentRequest>({
    member_id: "",
    sport_id: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [enrollmentsData, membersData, sportsData] = await Promise.all([
        enrollmentsService.getAll(),
        membersService.getAll(),
        sportsService.getAll(),
      ]);
      setEnrollments(enrollmentsData);
      setMembers(membersData);
      setSports(sportsData);
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const membersCollection = createListCollection({
    items: members.map(m => ({ label: `${m.name} (${m.dni})`, value: m.id })),
  });

  const sportsCollection = createListCollection({
    items: sports.map(s => ({ label: s.name, value: s.id })),
  });

  const openCreateModal = () => {
    setFormData({ member_id: "", sport_id: "" });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await enrollmentsService.create(formData);
      setIsDialogOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Error al crear la inscripción");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (enrollment: EnrollmentDTO) => {
    try {
      await enrollmentsService.update(enrollment.id, { is_active: !enrollment.is_active });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Error al actualizar la inscripción");
    }
  };

  const handleDelete = async (id: string, memberName?: string, sportName?: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la inscripción de "${memberName || 'socio'}" en "${sportName || 'deporte'}"?`)) {
      try {
        await enrollmentsService.delete(id);
        fetchData();
      } catch (err: any) {
        alert(err.message || "Error al eliminar la inscripción");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
      <Stack gap="8">
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">Inscripciones</Heading>
            <Text color="fg.muted" fontSize="md">
              Gestiona las inscripciones de los socios en los deportes del club.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Nueva Inscripción
            </Button>
          </HStack>
        </Flex>

        {/* Modal para crear inscripción */}
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Nueva Inscripción</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="Socio" required>
                  <SelectRoot 
                    collection={membersCollection}
                    value={formData.member_id ? [formData.member_id] : []}
                    onValueChange={(e) => setFormData({ ...formData, member_id: e.value[0] })}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Seleccione un socio" />
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
                <Field label="Deporte" required>
                  <SelectRoot 
                    collection={sportsCollection}
                    value={formData.sport_id ? [formData.sport_id] : []}
                    onValueChange={(e) => setFormData({ ...formData, sport_id: e.value[0] })}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Seleccione un deporte" />
                    </SelectTrigger>
                    <SelectContent>
                      {sportsCollection.items.map((item) => (
                        <SelectItem item={item} key={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>
              <Button type="submit" colorPalette="blue" loading={isSubmitting}>
                Crear Inscripción
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </form>
        </DialogContent>

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
              <Text color="fg.muted">Cargando inscripciones...</Text>
            </Stack>
          </Center>
        ) : enrollments.length === 0 ? (
          <Center h="300px">
            <Stack align="center" gap="4">
              <Text color="fg.muted">No se encontraron inscripciones.</Text>
              <Button variant="ghost" onClick={fetchData}>Reintentar</Button>
            </Stack>
          </Center>
        ) : (
          <Table.Root size="md" variant="line" interactive>
            <Table.Header>
              <Table.Row bg="bg.muted/50">
                <Table.ColumnHeader py="4">Socio</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Deporte</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Fecha de Inscripción</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Estado</Table.ColumnHeader>
                <Table.ColumnHeader py="4" textAlign="end">Acciones</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {enrollments.map((enrollment) => (
                <Table.Row key={enrollment.id} _hover={{ bg: "bg.muted/30" }}>
                  <Table.Cell fontWeight="semibold" color="fg.emphasized">
                    {enrollment.member_name || enrollment.member_id}
                  </Table.Cell>
                  <Table.Cell color="fg.muted">
                    {enrollment.sport_name || enrollment.sport_id}
                  </Table.Cell>
                  <Table.Cell color="fg.muted">
                    {new Date(enrollment.enrollment_date).toLocaleDateString('es-AR')}
                  </Table.Cell>
                  <Table.Cell>
                    <Box 
                      display="inline-block" 
                      px="2" 
                      py="0.5" 
                      borderRadius="md" 
                      bg={enrollment.is_active ? 'green.50' : 'red.50'} 
                      color={enrollment.is_active ? 'green.700' : 'red.700'} 
                      fontSize="xs" 
                      fontWeight="bold"
                    >
                      {enrollment.is_active ? "Activa" : "Inactiva"}
                    </Box>
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack gap="2" justify="flex-end">
                      <IconButton 
                        variant="ghost" 
                        size="sm" 
                        aria-label={enrollment.is_active ? "Desactivar inscripción" : "Activar inscripción"}
                        colorPalette={enrollment.is_active ? "orange" : "green"}
                        onClick={() => handleToggleActive(enrollment)}
                      >
                        {enrollment.is_active ? <LuPowerOff /> : <LuPower />}
                      </IconButton>
                      <IconButton 
                        variant="ghost" 
                        size="sm" 
                        colorPalette="red" 
                        aria-label="Eliminar inscripción"
                        onClick={() => handleDelete(enrollment.id, enrollment.member_name, enrollment.sport_name)}
                      >
                        <LuTrash2 />
                      </IconButton>
                    </HStack>
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
