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
  Input
} from "@chakra-ui/react";
import { LuPlus, LuPencil, LuTrash2, LuRefreshCw } from "react-icons/lu";
import { useEffect, useState } from "react";
import { sportsService } from "../services/sports";
import type { SportDTO, CreateSportRequest, UpdateSportRequest } from "@alentapp/shared";
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

export function SportsView() {
  const [sports, setSports] = useState<SportDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSportId, setEditingSportId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateSportRequest>({
    name: "",
    description: "",
    max_capacity: 1,
    additional_price: 0,
    requires_medical_certificate: false,
  });

  const fetchSports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sportsService.getAll();
      setSports(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los deportes");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSportId(null);
    setFormData({
      name: "",
      description: "",
      max_capacity: 1,
      additional_price: 0,
      requires_medical_certificate: false,
    });
    setIsDialogOpen(true);
  };

  const openEditModal = (sport: SportDTO) => {
    setEditingSportId(sport.id);
    setFormData({
      name: sport.name, // Se muestra pero no se envía al backend
      description: sport.description || "",
      max_capacity: sport.max_capacity,
      additional_price: sport.additional_price,
      requires_medical_certificate: sport.requires_medical_certificate,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingSportId) {
        // No enviar name en la actualización (inmutabilidad)
        const updateData: UpdateSportRequest = {
          description: formData.description,
          max_capacity: formData.max_capacity,
          additional_price: formData.additional_price,
          requires_medical_certificate: formData.requires_medical_certificate,
        };
        await sportsService.update(editingSportId, updateData);
      } else {
        await sportsService.create(formData);
      }
      setIsDialogOpen(false);
      fetchSports();
    } catch (err: any) {
      alert(err.message || "Error al guardar el deporte");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSport = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el deporte "${name}"? Esta acción lo ocultará del listado.`)) {
      try {
        await sportsService.delete(id);
        fetchSports();
      } catch (err: any) {
        alert(err.message || "Error al eliminar el deporte");
      }
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  return (
    <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
      <Stack gap="8">
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">Administración de Deportes</Heading>
            <Text color="fg.muted" fontSize="md">
              Gestiona el catálogo de deportes que ofrece el club.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={fetchSports} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Agregar Deporte
            </Button>
          </HStack>
        </Flex>

        {/* Modal para agregar/editar deporte */}
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingSportId ? "Editar Deporte" : "Agregar Nuevo Deporte"}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="Nombre" required>
                  <Input 
                    placeholder="Ej. Fútbol 11" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={!!editingSportId} // Inmutable en edición
                  />
                </Field>
                <Field label="Descripción">
                  <Input 
                    placeholder="Descripción del deporte (opcional)" 
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Field>
                <Field label="Cupo Máximo" required>
                  <Input 
                    type="number"
                    min="1"
                    placeholder="Ej. 30" 
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </Field>
                <Field label="Precio Adicional">
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej. 1500.00" 
                    value={formData.additional_price}
                    onChange={(e) => setFormData({ ...formData, additional_price: parseFloat(e.target.value) || 0 })}
                  />
                </Field>
                <Field label="¿Requiere Certificado Médico?">
                  <input 
                    type="checkbox"
                    checked={formData.requires_medical_certificate}
                    onChange={(e) => setFormData({ ...formData, requires_medical_certificate: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </Field>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>
              <Button type="submit" colorPalette="blue" loading={isSubmitting}>
                {editingSportId ? "Guardar Cambios" : "Crear Deporte"}
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
              <Text color="fg.muted">Cargando deportes...</Text>
            </Stack>
          </Center>
        ) : sports.length === 0 ? (
          <Center h="300px">
            <Stack align="center" gap="4">
              <Text color="fg.muted">No se encontraron deportes.</Text>
              <Button variant="ghost" onClick={fetchSports}>Reintentar</Button>
            </Stack>
          </Center>
        ) : (
          <Table.Root size="md" variant="line" interactive>
            <Table.Header>
              <Table.Row bg="bg.muted/50">
                <Table.ColumnHeader py="4">Nombre</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Descripción</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Cupo</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Precio Adic.</Table.ColumnHeader>
                <Table.ColumnHeader py="4">Cert. Médico</Table.ColumnHeader>
                <Table.ColumnHeader py="4" textAlign="end">Acciones</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sports.map((sport) => (
                <Table.Row key={sport.id} _hover={{ bg: "bg.muted/30" }}>
                  <Table.Cell fontWeight="semibold" color="fg.emphasized">
                    {sport.name}
                  </Table.Cell>
                  <Table.Cell color="fg.muted">{sport.description || "—"}</Table.Cell>
                  <Table.Cell color="fg.muted">{sport.max_capacity}</Table.Cell>
                  <Table.Cell color="fg.muted">
                    {sport.additional_price > 0 ? `$${sport.additional_price.toFixed(2)}` : "Sin costo"}
                  </Table.Cell>
                  <Table.Cell>
                    <Box 
                      display="inline-block" 
                      px="2" 
                      py="0.5" 
                      borderRadius="md" 
                      bg={sport.requires_medical_certificate ? 'orange.50' : 'green.50'} 
                      color={sport.requires_medical_certificate ? 'orange.700' : 'green.700'} 
                      fontSize="xs" 
                      fontWeight="bold"
                    >
                      {sport.requires_medical_certificate ? "Requerido" : "No requerido"}
                    </Box>
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack gap="2" justify="flex-end">
                      <IconButton 
                        variant="ghost" 
                        size="sm" 
                        aria-label="Editar deporte"
                        onClick={() => openEditModal(sport)}
                      >
                        <LuPencil />
                      </IconButton>
                      <IconButton 
                        variant="ghost" 
                        size="sm" 
                        colorPalette="red" 
                        aria-label="Eliminar deporte"
                        onClick={() => handleDeleteSport(sport.id, sport.name)}
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
