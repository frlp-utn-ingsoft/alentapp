import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    Stack,
    Text,
} from '@chakra-ui/react';
import { LuPlus, LuRefreshCw } from 'react-icons/lu';

export function LockersView() {
    const handleRefresh = () => {
        // TODO: Implementar refresh cuando el backend esté listo
        console.log('Refresh lockers');
    };

    const handleCreateLocker = () => {
        // TODO: Implementar creación de locker cuando el backend esté listo
        console.log('Create new locker');
    };

    return (
        <Stack gap="8">
            <Flex justify="space-between" align="center">
                <Stack gap="1">
                    <Heading size="2xl" fontWeight="bold">
                        Administración de Lockers
                    </Heading>

                    <Text color="fg.muted" fontSize="md">
                        Gestiona los lockers en Alentapp.
                    </Text>
                </Stack>

                <HStack gap="3">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                    >
                        <LuRefreshCw /> Actualizar
                    </Button>

                    <Button
                        colorPalette="blue"
                        size="md"
                        onClick={handleCreateLocker}
                    >
                        <LuPlus /> Agregar Locker
                    </Button>
                </HStack>
            </Flex>

            <Box
                bg="bg.panel"
                borderRadius="xl"
                boxShadow="sm"
                borderWidth="1px"
                overflow="hidden"
                minH="300px"
                p="6"
            >
                <Text color="fg.muted">
                    La funcionalidad de lockers estará disponible pronto...
                </Text>
            </Box>
        </Stack>
    );
}
