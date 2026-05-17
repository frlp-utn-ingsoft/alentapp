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
} from '@chakra-ui/react';
import { LuPlus, LuTrash2, LuRefreshCw } from 'react-icons/lu';
import { useEffect, useState } from 'react';
import { enrollmentsService } from '../services/enrollments';
import { membersService } from '../services/members';
import { sportsService } from '../services/sports';
import type { CreateEnrollmentRequest, EnrollmentDTO, MemberDTO, SportResponse } from '@alentapp/shared';
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

const emptyForm: CreateEnrollmentRequest = {
  member_id: '',
  sport_id: '',
};

export function EnrollmentsView() {
  const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [sports, setSports] = useState<SportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateEnrollmentRequest>(emptyForm);

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
      setError(err.message || 'Error al cargar las inscripciones');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData(emptyForm);
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
      alert(err.message || 'Error al crear la inscripción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEnrollment = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas dar de baja esta inscripción?')) {
      try {
        await enrollmentsService.delete(id);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Error al dar de baja la inscripción');
      }
    }
  };

  const getMemberName = (enrollment: EnrollmentDTO) =>
    enrollment.member_name || members.find((member) => member.id === enrollment.member_id)?.name || enrollment.member_id;

  const getSportName = (enrollment: EnrollmentDTO) =>
    enrollment.sport_name || sports.find((sport) => sport.id === enrollment.sport_id)?.name || enrollment.sport_id;

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
      <Stack gap="8">
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">Administración de Inscripciones</Heading>
            <Text color="fg.muted" fontSize="md">
              Gestiona el alta y la baja de socios en deportes.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal} disabled={members.length === 0 || sports.length === 0}>
              <LuPlus /> Nueva Inscripción
            </Button>
          </HStack>
        </Flex>

        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Nueva Inscripción</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="Socio" required>
                  <select
                    value={formData.member_id}
                    onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d4d4d8' }}
                  >
                    <option value="">Seleccione un socio</option>
                    {members.map((member) => (
                      <option value={member.id} key={member.id}>
                        {member.name} - DNI {member.dni}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Deporte" required>
                  <select
                    value={formData.sport_id}
                    onChange={(e) => setFormData({ ...formData, sport_id: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d4d4d8' }}
                  >
                    <option value="">Seleccione un deporte</option>
                    {sports.map((sport) => (
                      <option value={sport.id} key={sport.id}>
                        {sport.name}
                      </option>
                    ))}
                  </select>
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

        <Box bg="bg.panel" borderRadius="xl" boxShadow="sm" borderWidth="1px" overflow="hidden" minH="300px" position="relative">
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
                  <Table.ColumnHeader py="4">Fecha de inscripción</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Estado</Table.ColumnHeader>
                  <Table.ColumnHeader py="4" textAlign="end">Acciones</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {enrollments.map((enrollment) => (
                  <Table.Row key={enrollment.id} _hover={{ bg: 'bg.muted/30' }}>
                    <Table.Cell fontWeight="semibold" color="fg.emphasized">{getMemberName(enrollment)}</Table.Cell>
                    <Table.Cell color="fg.muted">{getSportName(enrollment)}</Table.Cell>
                    <Table.Cell color="fg.muted">{new Date(enrollment.enrollment_date).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>
                      <Box display="inline-block" px="2" py="0.5" borderRadius="md" bg="green.50" color="green.700" fontSize="xs" fontWeight="bold">
                        {enrollment.is_active ? 'Activa' : 'Inactiva'}
                      </Box>
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <IconButton variant="ghost" size="sm" colorPalette="red" aria-label="Dar de baja inscripción" onClick={() => handleDeleteEnrollment(enrollment.id)}>
                        <LuTrash2 />
                      </IconButton>
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
