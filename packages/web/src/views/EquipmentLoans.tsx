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
} from '@chakra-ui/react';
import { LuPlus, LuRefreshCw } from 'react-icons/lu';
import { useEffect, useState } from 'react';
import { equipmentLoansService } from '../services/equipmentLoans';
import type {
  EquipmentLoanDTO,
  CreateEquipmentLoanRequest,
} from '@alentapp/shared';
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

export function EquipmentLoansView() {
  const [loans, setLoans] = useState<EquipmentLoanDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateEquipmentLoanRequest>({
    itemName: '',
    dueDate: '',
    memberId: '',
  });

  const fetchLoans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await equipmentLoansService.getAll();
      setLoans(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los préstamos');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ itemName: '', dueDate: '', memberId: '' });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await equipmentLoansService.create(formData);
      setIsDialogOpen(false);
      fetchLoans();
    } catch (err: any) {
      alert(err.message || 'Error al registrar el préstamo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColor = (status: EquipmentLoanDTO['status']) => {
    if (status === 'Loaned') return { bg: 'blue.50', color: 'blue.700' };
    if (status === 'Returned') return { bg: 'green.50', color: 'green.700' };
    return { bg: 'red.50', color: 'red.700' };
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  return (
    <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
      <Stack gap="8">
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">
              Préstamos de Equipamiento
            </Heading>
            <Text color="fg.muted" fontSize="md">
              Gestión del equipamiento deportivo prestado a los socios.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={fetchLoans} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Registrar Préstamo
            </Button>
          </HStack>
        </Flex>

        {/* Modal de alta */}
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Préstamo</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="Nombre del Ítem" required>
                  <Input
                    placeholder="Ej. Pelota de fútbol"
                    value={formData.itemName}
                    onChange={(e) =>
                      setFormData({ ...formData, itemName: e.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Fecha de Devolución" required>
                  <Input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: new Date(e.target.value).toISOString() })
                    }
                    required
                  />
                </Field>
                <Field label="UUID del Socio" required>
                  <Input
                    placeholder="UUID del socio (Pleno u Honorario)"
                    value={formData.memberId}
                    onChange={(e) =>
                      setFormData({ ...formData, memberId: e.target.value })
                    }
                    required
                  />
                </Field>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogActionTrigger>
              <Button type="submit" colorPalette="blue" loading={isSubmitting}>
                Registrar
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </form>
        </DialogContent>

        {error && (
          <Box
            p="4"
            bg="red.50"
            color="red.700"
            borderRadius="md"
            border="1px solid"
            borderColor="red.200"
          >
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
                <Text color="fg.muted">Cargando préstamos...</Text>
              </Stack>
            </Center>
          ) : loans.length === 0 ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Text color="fg.muted">No hay préstamos registrados.</Text>
                <Button variant="ghost" onClick={fetchLoans}>
                  Reintentar
                </Button>
              </Stack>
            </Center>
          ) : (
            <Table.Root size="md" variant="line" interactive>
              <Table.Header>
                <Table.Row bg="bg.muted/50">
                  <Table.ColumnHeader py="4">Ítem</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Estado</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Fecha Préstamo</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Fecha Devolución</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Socio ID</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {loans.map((loan) => (
                  <Table.Row key={loan.id} _hover={{ bg: 'bg.muted/30' }}>
                    <Table.Cell fontWeight="semibold" color="fg.emphasized">
                      {loan.itemName}
                    </Table.Cell>
                    <Table.Cell>
                      <Box
                        display="inline-block"
                        px="2"
                        py="0.5"
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="bold"
                        {...statusColor(loan.status)}
                      >
                        {loan.status}
                      </Box>
                    </Table.Cell>
                    <Table.Cell color="fg.muted">
                      {new Date(loan.loanDate).toLocaleDateString('es-AR')}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">
                      {new Date(loan.dueDate).toLocaleDateString('es-AR')}
                    </Table.Cell>
                    <Table.Cell color="fg.muted" fontSize="xs">
                      {loan.memberId}
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