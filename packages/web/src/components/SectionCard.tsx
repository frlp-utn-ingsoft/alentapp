import { Box, VStack, Flex, Heading, Text, HStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import { LuArrowRight } from 'react-icons/lu';
import type { ElementType } from 'react';

export interface SectionCardProps {
    title: string;
    description: string;
    to: string;
    icon: ElementType;
}

export function SectionCard({
    title,
    description,
    to,
    icon: Icon,
}: SectionCardProps) {
    return (
        // 1. Añadimos height: "100%" al RouterLink
        <RouterLink
            to={to}
            style={{ textDecoration: 'none', display: 'block', height: '100%' }}
        >
            <Box
                p="6"
                bg="bg.panel"
                borderRadius="2xl"
                borderWidth="1px"
                borderColor="border.muted"
                boxShadow="sm"
                h="100%" // 2. Le decimos al Box que ocupe el 100% de la altura disponible
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: 'md',
                    borderColor: 'blue.500',
                }}
            >
                {/* 3. El VStack principal ahora tiene h="100%" y justify="space-between" */}
                <VStack
                    align="flex-start"
                    gap="4"
                    h="100%"
                    justify="space-between"
                >
                    {/* Contenedor para el icono y textos */}
                    <VStack align="flex-start" gap="4">
                        <Flex
                            w="12"
                            h="12"
                            borderRadius="xl"
                            bg="blue.50"
                            color="blue.600"
                            align="center"
                            justify="center"
                            mb="2"
                        >
                            <Icon size="24" />
                        </Flex>

                        <Box>
                            <Heading size="lg" fontWeight="bold" mb="2">
                                {title}
                            </Heading>
                            <Text color="fg.muted" fontSize="md">
                                {description}
                            </Text>
                        </Box>
                    </VStack>

                    {/* 4. Este enlace se alineará siempre en la parte inferior de la tarjeta */}
                    <HStack
                        color="blue.500"
                        fontSize="sm"
                        fontWeight="bold"
                        mt="4"
                    >
                        <Text>Ir a la sección</Text>
                        <LuArrowRight />
                    </HStack>
                </VStack>
            </Box>
        </RouterLink>
    );
}
