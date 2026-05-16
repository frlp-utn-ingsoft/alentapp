import { Box, Button, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import type { CreatePaymentRequest } from '@alentapp/shared';
import {
    DialogActionTrigger,
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Field } from './ui/field';
import { MemberSearchInput } from './MemberSearchInput';
import type { MemberDTO } from '@alentapp/shared';

type Props = {
    formData: CreatePaymentRequest;
    isSubmitting: boolean;

    memberSearch: string;
    memberResults: MemberDTO[];
    memberSearchRef: React.RefObject<HTMLDivElement | null>;

    onSubmit: (event: React.FormEvent) => void;
    onUpdateField: <K extends keyof CreatePaymentRequest>(
        field: K,
        value: CreatePaymentRequest[K],
    ) => void;
    onUpdateMonth: (value: string) => void;
    onUpdateYear: (value: string) => void;
    onSearchMember: (value: string) => void;
    onSelectMember: (member: MemberDTO) => void;
};

export function PaymentFormDialog({
    formData,
    isSubmitting,
    memberSearch,
    memberResults,
    memberSearchRef,
    onSubmit,
    onUpdateField,
    onUpdateMonth,
    onUpdateYear,
    onSearchMember,
    onSelectMember,
}: Props) {
    return (
        <DialogContent>
            <form onSubmit={onSubmit}>
                <DialogHeader>
                    <DialogTitle>Agregar Nuevo Pago</DialogTitle>
                </DialogHeader>

                <DialogBody>
                    <Stack gap="4">
                        <Field label="Socio" required>
                            <MemberSearchInput
                                value={memberSearch}
                                results={memberResults}
                                searchRef={memberSearchRef}
                                onSearch={onSearchMember}
                                onSelect={onSelectMember}
                            />
                        </Field>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                            <Field label="Mes" required>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={formData.month}
                                    onChange={(e) =>
                                        onUpdateMonth(e.target.value)
                                    }
                                    required
                                />
                            </Field>

                            <Field label="Año" required>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={formData.year}
                                    onChange={(e) =>
                                        onUpdateYear(e.target.value)
                                    }
                                    required
                                />
                            </Field>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                            <Field label="Monto" required>
                                <Box position="relative">
                                    <Text
                                        position="absolute"
                                        left="3"
                                        top="50%"
                                        transform="translateY(-50%)"
                                        color="fg.muted"
                                        pointerEvents="none"
                                    >
                                        $
                                    </Text>

                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={formData.amount}
                                        pl="7"
                                        onChange={(e) =>
                                            onUpdateField(
                                                'amount',
                                                Number(e.target.value),
                                            )
                                        }
                                        required
                                    />
                                </Box>
                            </Field>

                            <Field label="Fecha de Vencimiento" required>
                                <Input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) =>
                                        onUpdateField(
                                            'due_date',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </Field>
                        </SimpleGrid>
                    </Stack>
                </DialogBody>

                <DialogFooter>
                    <DialogActionTrigger asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogActionTrigger>

                    <Button
                        type="submit"
                        colorPalette="blue"
                        loading={isSubmitting}
                    >
                        Crear Pago
                    </Button>
                </DialogFooter>

                <DialogCloseTrigger />
            </form>
        </DialogContent>
    );
}