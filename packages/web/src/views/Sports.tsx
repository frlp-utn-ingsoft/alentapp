import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { type FormEvent, useState } from "react";
import type { CreateSportRequest, SportDTO } from "@alentapp/shared";
import { sportsService } from "../services/sports";

const initialFormData: CreateSportRequest = {
  name: "",
  description: "",
  max_capacity: 1,
  additional_price: 0,
  requires_medical_certificate: false,
};

export function SportsView() {
  const [formData, setFormData] = useState<CreateSportRequest>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSport, setCreatedSport] = useState<SportDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setCreatedSport(null);
    setError(null);

    try {
      const sport = await sportsService.create(formData);
      setCreatedSport(sport);
      setFormData(initialFormData);
    } catch (err: any) {
      setError(err.message || "Error al crear el deporte");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack gap="8">
      <Flex justify="space-between" align="center">
        <Stack gap="1">
          <Heading size="2xl" fontWeight="bold">Administración de Deportes</Heading>
          <Text color="fg.muted" fontSize="md">
            Crea deportes para publicarlos en la oferta del club.
          </Text>
        </Stack>
      </Flex>

      {error && (
        <Box p="4" bg="red.50" color="red.700" borderRadius="md" border="1px solid" borderColor="red.200">
          <Text fontWeight="bold">Error:</Text>
          <Text>{error}</Text>
        </Box>
      )}

      {createdSport && (
        <Box p="4" bg="green.50" color="green.700" borderRadius="md" border="1px solid" borderColor="green.200">
          <Text fontWeight="bold">Deporte creado correctamente</Text>
          <Text>ID: {createdSport.id}</Text>
        </Box>
      )}

      <Box p="6" bg="bg.panel" borderRadius="2xl" borderWidth="1px" borderColor="border.muted" boxShadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="5">
            <Stack gap="2">
              <Text fontWeight="medium">Nombre</Text>
              <Input
                placeholder="Ej. Natación"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                required
              />
            </Stack>

            <Stack gap="2">
              <Text fontWeight="medium">Descripción</Text>
              <Input
                placeholder="Ej. Clases de natación para adultos"
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                required
              />
            </Stack>

            <Stack gap="2">
              <Text fontWeight="medium">Capacidad máxima</Text>
              <Input
                type="number"
                min="1"
                value={formData.max_capacity}
                onChange={(event) => setFormData({ ...formData, max_capacity: Number(event.target.value) })}
                required
              />
            </Stack>

            <Stack gap="2">
              <Text fontWeight="medium">Precio adicional</Text>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.additional_price}
                onChange={(event) => setFormData({ ...formData, additional_price: Number(event.target.value) })}
                required
              />
            </Stack>

            <HStack gap="3">
              <input
                id="requires-medical-certificate"
                type="checkbox"
                checked={formData.requires_medical_certificate}
                onChange={(event) => setFormData({
                  ...formData,
                  requires_medical_certificate: event.target.checked,
                })}
              />
              <Text as="label" htmlFor="requires-medical-certificate" fontWeight="medium">
                Requiere certificado médico
              </Text>
            </HStack>

            <Button type="submit" colorPalette="blue" loading={isSubmitting} alignSelf="flex-start">
              Crear Deporte
            </Button>
          </Stack>
        </form>
      </Box>
    </Stack>
  );
}
