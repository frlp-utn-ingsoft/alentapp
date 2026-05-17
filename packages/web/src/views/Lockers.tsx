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

import { lockersService } from "../services/lockers";

import type {
LockerDTO,
CreateLockerRequest,
LockerLocation,
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

import {
SelectRoot,
SelectTrigger,
SelectValueText,
SelectContent,
SelectItem,
createListCollection,
} from "../components/ui/select";

const locations = createListCollection({
items: [
    { label: "Masculino", value: "MALE" },
    { label: "Femenino", value: "FEMALE" },
    { label: "Niños", value: "CHILDREN" },
],
});

export function LockersView() {
const [lockers, setLockers] = useState<LockerDTO[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const [isDialogOpen, setIsDialogOpen] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

const [formData, setFormData] =
    useState<CreateLockerRequest>({
    number: 1,
    location: "MALE",
    });

const fetchLockers = async () => {
    setIsLoading(true);
    setError(null);

    try {
    const data = await lockersService.getAll();
    setLockers(data);
    } catch (err: any) {
    setError(err.message || "Error al cargar lockers");
    } finally {
    setIsLoading(false);
    }
};

const openCreateModal = () => {
    setFormData({
    number: 1,
    location: "MALE",
    });

    setIsDialogOpen(true);
};

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
    await lockersService.create(formData);

    setIsDialogOpen(false);

    fetchLockers();
    } catch (err: any) {
    alert(err.message || "Error al crear locker");
    } finally {
    setIsSubmitting(false);
    }
};

useEffect(() => {
    fetchLockers();
}, []);

return (
    <DialogRoot
    open={isDialogOpen}
    onOpenChange={(e) => setIsDialogOpen(e.open)}
    >
    <Stack gap="8">
        <Flex justify="space-between" align="center">
        <Stack gap="1">
            <Heading size="2xl" fontWeight="bold">
            Administración de Lockers
            </Heading>

            <Text color="fg.muted" fontSize="md">
            Gestiona los lockers disponibles del club.
            </Text>
        </Stack>

        <HStack gap="3">
            <Button
            variant="outline"
            onClick={fetchLockers}
            disabled={isLoading}
            >
            <LuRefreshCw /> Actualizar
            </Button>

            <Button
            colorPalette="blue"
            size="md"
            onClick={openCreateModal}
            >
            <LuPlus /> Agregar Locker
            </Button>
        </HStack>
        </Flex>

        <DialogContent>
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>
                Agregar Nuevo Locker
            </DialogTitle>
            </DialogHeader>

            <DialogBody>
            <Stack gap="4">
                <Field label="Número" required>
                <Input
                    type="number"
                    min={1}
                    value={formData.number}
                    onChange={(e) =>
                    setFormData({
                        ...formData,
                        number: Number(e.target.value),
                    })
                    }
                    required
                />
                </Field>

                <Field label="Ubicación" required>
                <SelectRoot
                collection={locations}
                value={[formData.location]}
                onValueChange={(e) =>
                setFormData({
                ...formData,
                location: e.value[0] as LockerLocation,
                })
                }
> 

                    <SelectTrigger>
                    <SelectValueText placeholder="Seleccione ubicación" />
                    </SelectTrigger>

                    <SelectContent>
                    {locations.items.map((location) => (
                        <SelectItem
                        item={location}
                        key={location.value}
                        >
                        {location.label}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </SelectRoot>
                </Field>
            </Stack>
            </DialogBody>

            <DialogFooter>
            <DialogActionTrigger asChild>
                <Button variant="outline">
                Cancelar
                </Button>
            </DialogActionTrigger>

            <Button
                type="submit"
                colorPalette="blue"
                loading={isSubmitting}
            >
                Crear Locker
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
                <Spinner size="xl" />
                <Text color="fg.muted">
                Cargando lockers...
                </Text>
            </Stack>
            </Center>
        ) : lockers.length === 0 ? (
            <Center h="300px">
            <Stack align="center" gap="4">
                <Text color="fg.muted">
                No se encontraron lockers.
                </Text>

                <Button
                variant="ghost"
                onClick={fetchLockers}
                >
                Reintentar
                </Button>
            </Stack>
            </Center>
        ) : (
            <Table.Root
            size="md"
            variant="line"
            interactive
            >
            <Table.Header>
                <Table.Row bg="bg.muted/50">
                <Table.ColumnHeader py="4">
                    Número
                </Table.ColumnHeader>

                <Table.ColumnHeader py="4">
                    Ubicación
                </Table.ColumnHeader>

                <Table.ColumnHeader py="4">
                    Estado
                </Table.ColumnHeader>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {lockers.map((locker) => (
                <Table.Row key={locker.id}>
                    <Table.Cell fontWeight="semibold">
                    {locker.number}
                    </Table.Cell>

                    <Table.Cell>
                    {locker.location}
                    </Table.Cell>

                    <Table.Cell>
                    {locker.status}
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