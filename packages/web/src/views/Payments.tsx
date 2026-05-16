// packages/web/src/views/Payments.tsx

import { useState } from "react";
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  Input, 
  Button, 
  Field, 
  SimpleGrid,
  Alert
} from "@chakra-ui/react";
import { LuCheck, LuX } from "react-icons/lu";
import { membersService } from "../services/members"; // 👈 Recuperamos tu servicio oficial

export function PaymentsView() {
  // ─── ESTADOS DEL FORMULARIO ──────────────────────────────────────────────
  const [memberDni, setMemberDni] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para los carteles de feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Manejo nativo de carga
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // 🔍 PASO 1: Traemos todos los socios usando tu servicio oficial
      const socios = await membersService.getAll();

      // 🔍 PASO 2: Buscamos localmente el socio por el DNI ingresado
      const socioEncontrado = socios.find((s: any) => String(s.dni).trim() === memberDni.trim());

      if (!socioEncontrado) {
        throw new Error(`No se encontró ningún miembro con el DNI: ${memberDni}`);
      }

      // 🛠️ MODIFICADO: Agregamos ": any" para que Vite no choche con mayúsculas/minúsculas remanentes
      const paymentData: any = {
        memberId: socioEncontrado.id,
        amount: Number(amount),
        month: Number(month),
        year: Number(year),
        dueDate: dueDate
      };

      // 💳 PASO 3: Mandamos el pago a la ruta real de tu Fastify con /api/v1/
      const paymentResponse = await fetch("http://localhost:3000/api/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await paymentResponse.json();

      // Capturamos el error si Fastify devuelve un código de error (Ej: 400 o 409 Duplicado)
      if (!paymentResponse.ok) {
        throw new Error(paymentResult.error || "Error al procesar el pago en el servidor.");
      }

      // ✅ REQUISITO 2: El pago fue creado correctamente
      setSuccessMessage(`¡Pago creado con éxito para el socio ${socioEncontrado.name}!`);
      
      // Limpiamos los campos del formulario
      setMemberDni("");
      setAmount("");
      setDueDate("");

    } catch (error: any) {
      // ❌ REQUISITO 3: Mostrar cartel de error específico del TDD
      setErrorMessage(error.message || "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p="8" maxW="3xl" mx="auto" bg="bg.panel" borderRadius="3xl" borderWidth="1px" borderColor="border.subtle" mt="6">
      
      <VStack gap="2" align="flex-start" mb="8">
        <Heading size="3xl" fontWeight="extrabold" color="blue.600">
          Registrar Nuevo Pago
        </Heading>
        <Text fontSize="md" color="fg.muted">
          Ingresá el DNI del socio para identificarlo y asignarle una nueva cuota.
        </Text>
      </VStack>

      {/* CARTELES DE FEEDBACK */}
      <VStack gap="4" width="100%" mb="6" align="stretch">
        {successMessage && (
          <Alert.Root status="success" borderRadius="xl" p="4">
            <Alert.Indicator color="green.600">
              <LuCheck size="20" />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title fontWeight="bold" color="green.800">Operación Exitosa</Alert.Title>
              <Alert.Description color="green.700">{successMessage}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        {errorMessage && (
          <Alert.Root status="error" borderRadius="xl" p="4">
            <Alert.Indicator color="red.600">
              <LuX size="20" />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title fontWeight="bold" color="red.800">Error en la Operación</Alert.Title>
              <Alert.Description color="red.700">{errorMessage}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
      </VStack>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit}>
        <VStack gap="6" align="stretch">
          
          <Field.Root required>
            <Field.Label fontWeight="semibold">DNI del Socio</Field.Label>
            <Input 
              placeholder="Ej: 37824282" 
              value={memberDni}
              onChange={(e) => setMemberDni(e.target.value)}
              size="lg"
              borderRadius="xl"
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label fontWeight="semibold">Monto a Cobrar ($)</Field.Label>
            <Input 
              type="number"
              placeholder="Ej: 2500" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              size="lg"
              borderRadius="xl"
            />
          </Field.Root>

          <SimpleGrid columns={2} gap="4">
            <Field.Root required>
              <Field.Label fontWeight="semibold">Mes Correspondiente</Field.Label>
              <Input 
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                size="lg"
                borderRadius="xl"
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label fontWeight="semibold">Año</Field.Label>
              <Input 
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                size="lg"
                borderRadius="xl"
              />
            </Field.Root>
          </SimpleGrid>

          <Field.Root required>
            <Field.Label fontWeight="semibold">Fecha de Vencimiento</Field.Label>
            <Input 
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              size="lg"
              borderRadius="xl"
            />
          </Field.Root>

          <Button 
            type="submit" 
            colorScheme="blue" 
            size="lg" 
            loading={loading}
            borderRadius="xl"
            mt="4"
            fontWeight="bold"
          >
            Buscar Socio y Crear Pago
          </Button>
        </VStack>
      </form>
    </Box>
  );
}