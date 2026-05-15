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
  Input
} from "@chakra-ui/react";
import { LuPlus, LuRefreshCw } from "react-icons/lu";
import { useEffect, useState } from "react";

// Tendrás que crear este servicio similar a members.ts
import { medicalCertificatesService } from "../services/medicalCertificates"; 

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

type MedicalCertificateDTO = {
  id: string;
  issue_date: Date | string;
  expiry_date: Date | string;
  doctor_license: string;
  is_validated: boolean;
  member_id: string;
};

type CreateMedicalCertificateRequest = {
  member_id: string;
  issue_date: Date;
  expiry_date: Date;
  doctor_license: string;
};

export function MedicalCertificatesView() {
  const [certificates, setCertificates] = useState<MedicalCertificateDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del Formulario
  const [formData, setFormData] = useState<CreateMedicalCertificateRequest>({
    member_id: "",
    issue_date: new Date(),
    expiry_date: new Date(),
    doctor_license: "",
  });

  const fetchCertificates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Nota: Para que esto funcione, necesitarás agregar el endpoint GET en tu backend
      const data = await medicalCertificatesService.getAll();
      setCertificates(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los certificados");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ 
        member_id: "", 
        issue_date: new Date(), 
        expiry_date: new Date(), 
        doctor_license: "" 
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await medicalCertificatesService.create(formData);
      setIsDialogOpen(false);
      fetchCertificates(); // Refrescar la lista
    } catch (err: any) {
      alert(err.message || "Error al guardar el certificado");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
      <Stack gap="8">
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">Aptos Físicos</Heading>
            <Text color="fg.muted" fontSize="md">
              Gestiona los certificados médicos y la vigencia de los socios.
            </Text>
          </Stack>
          <HStack gap="3">
            <Button variant="outline" onClick={fetchCertificates} disabled={isLoading}>
              <LuRefreshCw /> Actualizar
            </Button>
            <Button colorPalette="blue" size="md" onClick={openCreateModal}>
              <LuPlus /> Registrar Certificado
            </Button>
          </HStack>
        </Flex>

        {/* Modal para agregar certificado */}
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Certificado</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="ID del Socio" required>
                  <Input 
                    placeholder="UUID del socio" 
                    value={formData.member_id}
                    onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Matrícula del Médico" required>
                  <Input 
                    placeholder="Ej. MN 123456" 
                    value={formData.doctor_license}
                    onChange={(e) => setFormData({ ...formData, doctor_license: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Fecha de Emisión" required>
                  <Input 
                    type="date" 
                    value={formData.issue_date.toString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, issue_date: new Date(e.target.value) })}
                    required
                  />
                </Field>
                <Field label="Fecha de Vencimiento" required>
                  <Input 
                    type="date" 
                    value={formData.expiry_date.toString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, expiry_date: new Date(e.target.value) })}
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
                Guardar Certificado
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
                <Text color="fg.muted">Cargando certificados...</Text>
              </Stack>
            </Center>
          ) : certificates.length === 0 ? (
            <Center h="300px">
              <Stack align="center" gap="4">
                <Text color="fg.muted">No se encontraron aptos físicos registrados.</Text>
                <Button variant="ghost" onClick={fetchCertificates}>Reintentar</Button>
              </Stack>
            </Center>
          ) : (
            <Table.Root size="md" variant="line" interactive>
              <Table.Header>
                <Table.Row bg="bg.muted/50">
                  <Table.ColumnHeader py="4">ID Socio</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Matrícula</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Emisión</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Vencimiento</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Estado</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {certificates.map((cert) => (
                  <Table.Row key={cert.id} _hover={{ bg: "bg.muted/30" }}>
                    <Table.Cell fontWeight="semibold" color="fg.emphasized">
                      {cert.member_id.substring(0, 8)}... {/* Muestra un UUID acortado temporalmente */}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">{cert.doctor_license}</Table.Cell>
                    <Table.Cell color="fg.muted">{new Date(cert.issue_date).toLocaleDateString()}</Table.Cell>
                    <Table.Cell color="fg.muted">{new Date(cert.expiry_date).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>
                      <Box 
                        display="inline-block" 
                        px="2" 
                        py="0.5" 
                        borderRadius="md" 
                        bg={cert.is_validated ? 'green.50' : 'gray.100'} 
                        color={cert.is_validated ? 'green.700' : 'gray.600'} 
                        fontSize="xs" 
                        fontWeight="bold"
                      >
                        {cert.is_validated ? 'Vigente' : 'Histórico'}
                      </Box>
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
