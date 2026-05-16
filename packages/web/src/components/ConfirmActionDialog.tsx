
import { Button, Stack, Text, Box } from '@chakra-ui/react';
import {
    DialogActionTrigger,
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';

type ConfirmActionDialogVariant = 'danger' | 'warning' | 'info';

type Props = {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    error?: string | null;
    variant?: ConfirmActionDialogVariant;
    onConfirm: () => void;
    children?: React.ReactNode;
};

export function ConfirmActionDialog({
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    isLoading = false,
    error = null,
    variant = 'danger',
    onConfirm,
    children,
}: Props) {
    const confirmColorPalette =
        variant === 'danger'
            ? 'red'
            : variant === 'warning'
              ? 'orange'
              : 'blue';

    const alertBg =
        variant === 'danger'
            ? 'red.50'
            : variant === 'warning'
              ? 'orange.50'
              : 'blue.50';

    const alertColor =
        variant === 'danger'
            ? 'red.700'
            : variant === 'warning'
              ? 'orange.700'
              : 'blue.700';

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>

            <DialogBody>
                <Stack gap="4">
                    <Text color="fg.muted">{description}</Text>

                    {children && (
                        <Box
                            rounded="md"
                            bg={alertBg}
                            color={alertColor}
                            p="3"
                            fontSize="sm"
                        >
                            {children}
                        </Box>
                    )}

                    {error && (
                        <Box
                            rounded="md"
                            bg="red.50"
                            color="red.700"
                            p="3"
                            fontSize="sm"
                        >
                            {error}
                        </Box>
                    )}
                </Stack>
            </DialogBody>

            <DialogFooter>
                <DialogActionTrigger asChild>
                    <Button variant="outline" disabled={isLoading}>
                        {cancelLabel}
                    </Button>
                </DialogActionTrigger>

                <Button
                    colorPalette={confirmColorPalette}
                    loading={isLoading}
                    onClick={onConfirm}
                >
                    {confirmLabel}
                </Button>
            </DialogFooter>

            <DialogCloseTrigger />
        </DialogContent>
    );
}