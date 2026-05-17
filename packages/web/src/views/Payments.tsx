import { useState, useEffect } from 'react';
import { 
    Box, Button, Stack, Text, Heading, 
    Flex, HStack, Spinner, Center, Table
} from "@chakra-ui/react";
import { LuPlus, LuRefreshCw } from 'react-icons/lu';
import { membersService } from '../services/members';
import { paymentsService } from '../services/payments';
import type { MemberDTO, PaymentDTO } from '@alentapp/shared';
import { Toaster, toaster } from "../components/ui/toaster";
import { PaymentCreateDialog } from '../components/PaymentCreateDialog';

export const PaymentsView = () => {
    const [payments, setPayments] = useState<PaymentDTO[]>([]);
    const [members, setMembers] = useState<MemberDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [paymentsData, membersData] = await Promise.all([
                paymentsService.getAll(),
                membersService.getAll()
            ]);
            setPayments(paymentsData);
            setMembers(membersData);
        } catch (error: any) {
            toaster.create({ title: "Error", description: error.message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getMemberName = (id: string) => {
        const member = members.find(m => m.id === id);
        return member ? member.name : 'Desconocido';
    };

    return (
        <Stack gap="8">
            <Toaster />
            
            <Flex justify="space-between" align="center">
                <Stack gap="1">
                    <Heading size="2xl" fontWeight="bold">Administración de Pagos</Heading>
                    <Text color="fg.muted" fontSize="md">
                        Gestiona las cuotas y pagos de los socios del club.
                    </Text>
                </Stack>
                <HStack gap="3">
                    <Button variant="outline" onClick={fetchData} disabled={isLoading}>
                        <LuRefreshCw /> Actualizar
                    </Button>
                    <Button colorPalette="blue" size="md" onClick={() => setIsDialogOpen(true)}>
                        <LuPlus /> Registrar Pago
                    </Button>
                </HStack>
            </Flex>

            <PaymentCreateDialog 
                isOpen={isDialogOpen} 
                onOpenChange={(e) => setIsDialogOpen(e.open)} 
                members={members}
                onSuccess={fetchData}
            />

            <Box bg="bg.panel" borderRadius="xl" boxShadow="sm" borderWidth="1px" overflow="hidden" minH="300px" position="relative">
                {isLoading ? (
                    <Center h="300px">
                        <Stack align="center" gap="4">
                            <Spinner size="xl" color="blue.500" />
                            <Text color="fg.muted">Cargando pagos...</Text>
                        </Stack>
                    </Center>
                ) : payments.length === 0 ? (
                    <Center h="300px">
                        <Stack align="center" gap="4">
                            <Text color="fg.muted">No se encontraron pagos registrados.</Text>
                            <Button variant="ghost" onClick={fetchData}>Reintentar</Button>
                        </Stack>
                    </Center>
                ) : (
                    <Table.Root size="md" variant="line" interactive>
                        <Table.Header>
                            <Table.Row bg="bg.muted/50">
                                <Table.ColumnHeader py="4">Socio</Table.ColumnHeader>
                                <Table.ColumnHeader py="4">Periodo</Table.ColumnHeader>
                                <Table.ColumnHeader py="4">Monto</Table.ColumnHeader>
                                <Table.ColumnHeader py="4">Vencimiento</Table.ColumnHeader>
                                <Table.ColumnHeader py="4">Estado</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {payments.map((payment) => (
                                <Table.Row key={payment.id} _hover={{ bg: 'bg.muted/30' }}>
                                    <Table.Cell fontWeight="semibold" color="fg.emphasized">
                                        {getMemberName(payment.member_id)}
                                    </Table.Cell>
                                    <Table.Cell color="fg.muted">
                                        {payment.month}/{payment.year}
                                    </Table.Cell>
                                    <Table.Cell color="fg.muted">
                                        ${payment.amount.toLocaleString()}
                                    </Table.Cell>
                                    <Table.Cell color="fg.muted">
                                        {payment.due_date}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Box 
                                            display="inline-block" 
                                            px="2" py="0.5" 
                                            borderRadius="md" 
                                            bg={payment.status === 'Paid' ? 'green.50' : 'orange.50'} 
                                            color={payment.status === 'Paid' ? 'green.700' : 'orange.700'} 
                                            fontSize="xs" 
                                            fontWeight="bold"
                                        >
                                            {payment.status === 'Paid' ? 'Pagado' : 'Pendiente'}
                                        </Box>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                )}
            </Box>
        </Stack>
    );
};
