import { Button, Heading, HStack, Stack, Text, Box, Flex, Input, Spinner, Center } from "@chakra-ui/react";
import { LuSend, LuRefreshCw } from "react-icons/lu";
import { useEffect, useState } from "react";
import { medicalCertificatesService } from "../services/medicalCertificates";
import { membersService } from "../services/members";
import type { MemberDTO } from "@alentapp/shared";
import { Field } from "../components/ui/field";
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
  createListCollection
} from "../components/ui/select";
export function MedicalCertificatesView() {
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    memberId: "",
    expiryDate: "",
    doctorLicense: "",
  });
  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    setError(null);
    try {
      const data = await membersService.getAll();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los socios");
    } finally {
      setIsLoadingMembers(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await medicalCertificatesService.create({
        memberId: formData.memberId,
        expiryDate: formData.expiryDate,
        doctorLicense: formData.doctorLicense,
      });
      setSuccessMessage("Certificado médico creado exitosamente.");
      setFormData({ memberId: "", expiryDate: "", doctorLicense: "" });
    } catch (err: any) {
      setError(err.message || "Error al crear el certificado");
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    fetchMembers();
  }, []);
  const membersCollection = createListCollection({
    items: members.map((m) => ({
      label: `${m.name} - ${m.dni}`,
      value: m.id,
    })),
  });
  return (
    <Stack gap="8">
      <Flex justify="space-between" align="center">
        <Stack gap="1">
          <Heading size="2xl" fontWeight="bold">Certificados Médicos</Heading>
          <Text color="fg.muted" fontSize="md">
            Emitir nuevos certificados médicos para los socios.
          </Text>
        </Stack>
        <Button variant="outline" onClick={fetchMembers} disabled={isLoadingMembers}>
          <LuRefreshCw /> Actualizar Socios
        </Button>
      </Flex>
      <Box bg="bg.panel" borderRadius="xl" boxShadow="sm" borderWidth="1px" p="6">
        <form onSubmit={handleSubmit}>
          <Stack gap="4" maxW="lg">
            <Text fontWeight="bold" fontSize="lg">Nuevo Certificado Médico</Text>
            <Field label="Socio" required>
              {isLoadingMembers ? (
                <Center py="2"><Spinner size="sm" /></Center>
              ) : (
                <SelectRoot
                  collection={membersCollection}
                  value={formData.memberId ? [formData.memberId] : []}
                  onValueChange={(e) => setFormData({ ...formData, memberId: e.value[0] })}
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
              )}
            </Field>
            <Field label="Fecha de Vencimiento" required>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </Field>
            <Field label="Número de Licencia" required>
              <Input
                placeholder="Ej. 123456"
                value={formData.doctorLicense}
                onChange={(e) => setFormData({ ...formData, doctorLicense: e.target.value })}
                required
              />
            </Field>
            <HStack gap="3" pt="2">
              <Button type="submit" colorPalette="blue" loading={isSubmitting}>
                <LuSend /> Crear Certificado
              </Button>
            </HStack>
          </Stack>
        </form>
      </Box>
      {error && (
        <Box p="4" bg="red.50" color="red.700" borderRadius="md" border="1px solid" borderColor="red.200">
          <Text fontWeight="bold">Error:</Text>
          <Text>{error}</Text>
        </Box>
      )}
      {successMessage && (
        <Box p="4" bg="green.50" color="green.700" borderRadius="md" border="1px solid" borderColor="green.200">
          <Text fontWeight="bold">Éxito:</Text>
          <Text>{successMessage}</Text>
        </Box>
      )}
    </Stack>
  );
}