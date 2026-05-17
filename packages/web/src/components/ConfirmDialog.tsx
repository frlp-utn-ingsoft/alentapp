import { Button, Text } from '@chakra-ui/react';
import {
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogActionTrigger,
    DialogCloseTrigger,
} from './ui/dialog';

interface ConfirmDialogProps {
    isOpen: boolean;
    onOpenChange: (details: { open: boolean }) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    isConfirmLoading?: boolean;
    colorPalette?: string;
}

export const ConfirmDialog = ({
    isOpen,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    isConfirmLoading = false,
    colorPalette = 'red',
}: ConfirmDialogProps) => {
    return (
        <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <Text color="fg.muted">{description}</Text>
                </DialogBody>
                <DialogFooter>
                    <DialogActionTrigger asChild>
                        <Button variant="outline" disabled={isConfirmLoading}>
                            {cancelText}
                        </Button>
                    </DialogActionTrigger>
                    <Button
                        colorPalette={colorPalette}
                        onClick={onConfirm}
                        loading={isConfirmLoading}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
                <DialogCloseTrigger disabled={isConfirmLoading} />
            </DialogContent>
        </DialogRoot>
    );
};
