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
} from "@chakra-ui/react";
import { LuPlus, LuPencil, LuTrash2, LuRefreshCw, LuSearch } from "react-icons/lu";
import { useEffect, useMemo, useState } from "react";
import { disciplinesService } from "../services/disciplines";
import { membersService } from "../services/members";
import type {
  CreateDisciplineRequest,
  DisciplineDTO,
  MemberDTO,
  MemberDisciplineStatusResponse,
  UpdateDisciplineRequest,
} from "@alentapp/shared";
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

const formatDateForInput = (date: string) => date ? date.split("T")[0] : "";
const formatMemberLabel = (member: MemberDTO) => `${member.name} - ${member.dni}`;
const isDisciplineActive = (discipline: DisciplineDTO) => {
  const now = new Date();
  const startDate = new Date(discipline.startDate);
  const endDate = new Date(discipline.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return false;
  }

  return startDate <= now && now < endDate;
};

export function DisciplinesView() {
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberStatuses, setMemberStatuses] = useState<Record<string, MemberDisciplineStatusResponse>>({});
  const [memberDisciplines, setMemberDisciplines] = useState<Record<string, DisciplineDTO[]>>({});
  const [disciplines, setDisciplines] = useState<DisciplineDTO[]>([]);
  const [disciplineStatus, setDisciplineStatus] = useState<MemberDisciplineStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMemberSearch, setFormMemberSearch] = useState("");
  const [editingDisciplineId, setEditingDisciplineId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateDisciplineRequest>({
    reason: "",
    startDate: "",
    endDate: "",
    isTotalSuspension: false,
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

  const selectedMember = members.find((member) => member.id === selectedMemberId);
  const selectedMemberHasActiveDiscipline = (disciplines || []).some(isDisciplineActive);

  const filteredFormMembers = useMemo(() => {
    const search = formMemberSearch.trim().toLowerCase();

    if (!search) {
      return members;
    }

    return members.filter((member) =>
        member.name.toLowerCase().includes(search) ||
        member.dni.toLowerCase().includes(search)
    );
  }, [formMemberSearch, members]);

  const selectedFormMember = members.find((member) => member.id === formData.memberId);

  const fetchMemberSummaries = async (memberData: MemberDTO[]) => {
    const summaries = await Promise.all(
      memberData.map(async (member) => {
        const [status, memberDisciplineData] = await Promise.all([
          disciplinesService.getStatus(member.id),
          disciplinesService.getByMember(member.id),
        ]);

        return {
          memberId: member.id,
          status,
          disciplines: memberDisciplineData || [],
        };
      })
    );

    setMemberStatuses(Object.fromEntries(summaries.map((summary) => [summary.memberId, summary.status])));
    setMemberDisciplines(Object.fromEntries(summaries.map((summary) => [summary.memberId, summary.disciplines])));
  };

  const fetchDisciplines = async (memberId = selectedMemberId) => {
    if (!memberId) {
      setDisciplines([]);
      setDisciplineStatus(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [disciplineData, statusData] = await Promise.all([
        disciplinesService.getByMember(memberId),
        disciplinesService.getStatus(memberId),
      ]);
      setDisciplines(disciplineData || []);
      setDisciplineStatus(statusData);
      setMemberStatuses((current) => ({ ...current, [memberId]: statusData }));
      setMemberDisciplines((current) => ({ ...current, [memberId]: disciplineData || [] }));
    } catch (err: any) {
      setError(err.message || "Error al cargar las sanciones");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await membersService.getAll();
      setMembers(data);
      await fetchMemberSummaries(data);

      const nextMemberId = selectedMemberId || data[0]?.id || "";
      setSelectedMemberId(nextMemberId);
      setFormData((current) => ({ ...current, memberId: nextMemberId }));

      if (nextMemberId) {
        await fetchDisciplines(nextMemberId);
      } else {
        setDisciplines([]);
        setDisciplineStatus(null);
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar los miembros");
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingDisciplineId(null);
    setFormError(null);
    const currentMember = members.find((member) => member.id === selectedMemberId);
    setFormMemberSearch(currentMember ? formatMemberLabel(currentMember) : "");
    setFormData({
      reason: "",
      startDate: "",
      endDate: "",
      isTotalSuspension: false,
      memberId: selectedMemberId,
    });
    setIsDialogOpen(true);
  };

  const openEditModal = (discipline: DisciplineDTO) => {
    setEditingDisciplineId(discipline.id);
    setFormError(null);
    setFormMemberSearch("");
    setFormData({
      reason: discipline.reason,
      startDate: formatDateForInput(discipline.startDate),
      endDate: formatDateForInput(discipline.endDate),
      isTotalSuspension: discipline.isTotalSuspension,
      memberId: discipline.memberId,
    });
    setIsDialogOpen(true);
  };

  const handleMemberChange = (memberId: string) => {
    setSelectedMemberId(memberId);
    setFormData((current) => ({ ...current, memberId }));
    fetchDisciplines(memberId);
  };

  const validateForm = () => {
    if (!formData.memberId) {
      return "Seleccione un miembro";
    }

    if (!formData.reason.trim()) {
      return "El motivo de la sancion es obligatorio";
    }

    if (!formData.startDate || !formData.endDate) {
      return "Faltan campos requeridos";
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return "Las fechas ingresadas no son validas";
    }

    if (endDate <= startDate) {
      return "La fecha de fin debe ser posterior a la de inicio";
    }

    return null;
  };

  const handleFormMemberSearchChange = (value: string) => {
    setFormMemberSearch(value);

    if (!selectedFormMember || value !== formatMemberLabel(selectedFormMember)) {
      setFormData((current) => ({ ...current, memberId: "" }));
    }
  };

  const selectFormMember = (member: MemberDTO) => {
    setFormData((current) => ({ ...current, memberId: member.id }));
    setFormMemberSearch(formatMemberLabel(member));
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
      if (editingDisciplineId) {
        const updateData: UpdateDisciplineRequest = {
          reason: formData.reason,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isTotalSuspension: formData.isTotalSuspension,
        };
        await disciplinesService.update(editingDisciplineId, updateData);
      } else {
        await disciplinesService.create(formData);
      }
      setIsDialogOpen(false);
      fetchDisciplines(formData.memberId);
    } catch (err: any) {
      setFormError(err.message || "Error al guardar la sancion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDiscipline = async (id: string, reason: string) => {
    if (window.confirm(`Estas seguro de que deseas eliminar la sancion "${reason}"? Esta accion no se puede deshacer.`)) {
      try {
        await disciplinesService.delete(id);
        fetchDisciplines(selectedMemberId);
      } catch (err: any) {
        alert(err.message || "Error al eliminar la sancion");
      }
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
            <Heading size="2xl" fontWeight="bold">Administracion de Sanciones</Heading>
            <Text color="fg.muted" fontSize="md">
              Gestiona las sanciones disciplinarias asociadas a cada miembro.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={() => fetchDisciplines()} disabled={isLoading || !selectedMemberId}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal} disabled={!selectedMemberId}>
              <LuPlus /> Agregar Sancion
            </Button>
          </HStack>
        </Flex>

        <Box>
          <Stack gap="4">
            <Field label="Buscar miembro">
              <Input
                placeholder="Buscar por nombre o DNI"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </Field>

            <Box
              bg="bg.panel"
              borderRadius="xl"
              boxShadow="sm"
              borderWidth="1px"
              overflow="hidden"
            >
              {members.length === 0 && !isLoading ? (
                <Center h="120px">
                  <Text color="fg.muted">No se encontraron miembros.</Text>
                </Center>
              ) : filteredMembers.length === 0 && !isLoading ? (
                <Center h="120px">
                  <Text color="fg.muted">No hay miembros para esa busqueda.</Text>
                </Center>
              ) : (
                <Table.Root size="sm" variant="line" interactive>
                  <Table.Header>
                    <Table.Row bg="bg.muted/50">
                      <Table.ColumnHeader py="3">Nombre</Table.ColumnHeader>
                      <Table.ColumnHeader py="3">DNI</Table.ColumnHeader>
                      <Table.ColumnHeader py="3">Sancion vigente</Table.ColumnHeader>
                      <Table.ColumnHeader py="3">Suspension total</Table.ColumnHeader>
                      <Table.ColumnHeader py="3" textAlign="end">Historial</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredMembers.map((member) => {
                      const status = memberStatuses[member.id];
                      const hasActiveDiscipline = (memberDisciplines[member.id] || []).some(isDisciplineActive);
                      const isSelected = member.id === selectedMemberId;

                      return (
                        <Table.Row
                          key={member.id}
                          bg={isSelected ? "bg.muted" : undefined}
                          boxShadow={isSelected ? "inset 3px 0 0 var(--chakra-colors-blue-500)" : undefined}
                        >
                          <Table.Cell fontWeight="semibold" color="fg.emphasized">
                            {member.name}
                          </Table.Cell>
                          <Table.Cell color="fg.muted">{member.dni}</Table.Cell>
                          <Table.Cell>
                            <Box
                              display="inline-block"
                              px="2"
                              py="0.5"
                              borderRadius="md"
                              bg={hasActiveDiscipline ? "orange.50" : "green.50"}
                              color={hasActiveDiscipline ? "orange.700" : "green.700"}
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              {hasActiveDiscipline ? "Si" : "No"}
                            </Box>
                          </Table.Cell>
                          <Table.Cell>
                            <Box
                              display="inline-block"
                              px="2"
                              py="0.5"
                              borderRadius="md"
                              bg={status?.isSuspended ? "orange.50" : "green.50"}
                              color={status?.isSuspended ? "orange.700" : "green.700"}
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              {status?.isSuspended ? "Si" : "No"}
                            </Box>
                          </Table.Cell>
                          <Table.Cell textAlign="end">
                            <Button size="sm" variant="outline" colorPalette={isSelected ? "blue" : undefined} onClick={() => handleMemberChange(member.id)}>
                              <LuSearch /> Ver historial
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              )}
            </Box>
          </Stack>
        </Box>

        {disciplineStatus && selectedMember && (
          <Box
            p="4"
            bg={disciplineStatus.isSuspended || selectedMemberHasActiveDiscipline ? "orange.50" : "green.50"}
            color={disciplineStatus.isSuspended || selectedMemberHasActiveDiscipline ? "orange.700" : "green.700"}
            borderRadius="md"
            border="1px solid"
            borderColor={disciplineStatus.isSuspended || selectedMemberHasActiveDiscipline ? "orange.200" : "green.200"}
          >
            <Text fontWeight="bold">
              {disciplineStatus.isSuspended
                ? `${selectedMember.name} tiene suspension total activa`
                : selectedMemberHasActiveDiscipline
                  ? `${selectedMember.name} tiene sanciones vigentes, sin suspension total activa`
                  : `${selectedMember.name} no tiene sanciones vigentes`}
            </Text>
          </Box>
        )}

        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingDisciplineId ? "Editar Sancion" : "Agregar Nueva Sancion"}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                {formError && (
                  <Box p="3" bg="red.50" color="red.700" borderRadius="md" border="1px solid" borderColor="red.200">
                    <Text>{formError}</Text>
                  </Box>
                )}
                {!editingDisciplineId && (
                  <Field label="Miembro" required>
                    <Stack gap="2">
                      <Input
                        placeholder="Buscar miembro por nombre o DNI"
                        value={formMemberSearch}
                        onChange={(e) => handleFormMemberSearchChange(e.target.value)}
                      />
                      {formMemberSearch && !formData.memberId && (
                        <Box
                          borderWidth="1px"
                          borderColor="border.muted"
                          borderRadius="md"
                          overflow="hidden"
                          bg="bg.panel"
                        >
                          {filteredFormMembers.length === 0 ? (
                            <Box px="3" py="2">
                              <Text color="fg.muted" fontSize="sm">No hay miembros para esa busqueda.</Text>
                            </Box>
                          ) : (
                            filteredFormMembers.map((member) => (
                              <Button
                                key={member.id}
                                type="button"
                                variant="ghost"
                                justifyContent="flex-start"
                                width="100%"
                                borderRadius="0"
                                onClick={() => selectFormMember(member)}
                              >
                                {formatMemberLabel(member)}
                              </Button>
                            ))
                          )}
                        </Box>
                      )}
                      {selectedFormMember && (
                        <Text color="fg.muted" fontSize="sm">
                          Miembro seleccionado: {formatMemberLabel(selectedFormMember)}
                        </Text>
                      )}
                    </Stack>
                  </Field>
                )}
                <Field label="Motivo" required>
                  <Input
                    placeholder="Ej. Conducta antideportiva"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Fecha de Inicio" required>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Fecha de Fin" required>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Suspension Total">
                  <HStack gap="3">
                    <input
                      aria-label="Suspension total"
                      type="checkbox"
                      checked={formData.isTotalSuspension}
                      onChange={(e) => setFormData({ ...formData, isTotalSuspension: e.target.checked })}
                    />
                    <Text color="fg.muted" fontSize="sm">
                      {formData.isTotalSuspension ? "Si" : "No"}
                    </Text>
                  </HStack>
                </Field>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>
              <Button type="submit" colorPalette="blue" loading={isSubmitting}>
                {editingDisciplineId ? "Guardar Cambios" : "Crear Sancion"}
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
                <Text color="fg.muted">Cargando sanciones...</Text>
              </Stack>
            </Center>
          ) : members.length === 0 ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Text color="fg.muted">No se encontraron miembros.</Text>
                <Button variant="ghost" onClick={fetchMembers}>Reintentar</Button>
              </Stack>
            </Center>
          ) : disciplines.length === 0 ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Text color="fg.muted">No se encontraron sanciones.</Text>
                <Button variant="ghost" onClick={() => fetchDisciplines()}>Reintentar</Button>
              </Stack>
            </Center>
          ) : (
            <Table.Root size="md" variant="line" interactive>
              <Table.Header>
                <Table.Row bg="bg.muted/50">
                  <Table.ColumnHeader py="4">Motivo</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Inicio</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Fin</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Suspension Total</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Vigencia</Table.ColumnHeader>
                  <Table.ColumnHeader py="4" textAlign="end">Acciones</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {disciplines.map((discipline) => (
                  <Table.Row key={discipline.id} _hover={{ bg: "bg.muted/30" }}>
                    <Table.Cell fontWeight="semibold" color="fg.emphasized">
                      {discipline.reason}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">{formatDateForInput(discipline.startDate)}</Table.Cell>
                    <Table.Cell color="fg.muted">{formatDateForInput(discipline.endDate)}</Table.Cell>
                    <Table.Cell>
                      <Box
                        display="inline-block"
                        px="2"
                        py="0.5"
                        borderRadius="md"
                        bg={discipline.isTotalSuspension ? "orange.50" : "blue.50"}
                        color={discipline.isTotalSuspension ? "orange.700" : "blue.700"}
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {discipline.isTotalSuspension ? "Si" : "No"}
                      </Box>
                    </Table.Cell>
                    <Table.Cell>
                      <Box
                        display="inline-block"
                        px="2"
                        py="0.5"
                        borderRadius="md"
                        bg={isDisciplineActive(discipline) ? "green.50" : "gray.50"}
                        color={isDisciplineActive(discipline) ? "green.700" : "gray.700"}
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {isDisciplineActive(discipline) ? "Activa" : "Inactiva"}
                      </Box>
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <HStack gap="2" justify="flex-end">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="Editar sancion"
                          onClick={() => openEditModal(discipline)}
                        >
                          <LuPencil />
                        </IconButton>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          colorPalette="red"
                          aria-label="Eliminar sancion"
                          onClick={() => handleDeleteDiscipline(discipline.id, discipline.reason)}
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
