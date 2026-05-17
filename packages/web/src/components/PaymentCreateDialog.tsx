import { useState } from 'react';
import { 
    Button, Input, Stack, createListCollection 
} from "@chakra-ui/react";
import { 
    SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText 
} from "./ui/select";
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
import { Field } from "./ui/field";
import { paymentsService } from '../services/payments';
import type { MemberDTO } from '@alentapp/shared';
import { toaster } from "./ui/toaster";

interface PaymentCreateDialogProps {
    isOpen: boolean;
    onOpenChange: (details: { open: boolean }) => void;
    members: MemberDTO[];
    onSuccess: () => void;
}

export const PaymentCreateDialog = ({ isOpen, onOpenChange, members, onSuccess }: PaymentCreateDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        member_id: '',
        amount: '' as number | '',
        month: (new Date().getMonth() + 1) as number | '',
        year: new Date().getFullYear() as number | '',
        due_date: new Date().toISOString().split('T')[0]
    });

    const membersList = createListCollection({
        items: members.map(m => ({ label: `${m.name} (DNI: ${m.dni})`, value: m.id }))
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await paymentsService.create({
                ...formData,
                amount: formData.amount === '' ? 0 : Number(formData.amount),
                month: formData.month === '' ? 0 : Number(formData.month),
                year: formData.year === '' ? 0 : Number(formData.year)
            });
            toaster.create({ title: "Pago registrado", type: "success" });
            onOpenChange({ open: false });
            onSuccess();
            
            // Limpiar formulario
            setFormData({ 
                member_id: '', 
                amount: '', 
                month: new Date().getMonth() + 1, 
                year: new Date().getFullYear(), 
                due_date: new Date().toISOString().split('T')[0] 
            });
        } catch (error: any) {
            toaster.create({ title: "Error", description: error.message, type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Registrar Nuevo Pago</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Stack gap="4">
                            <Field label="Socio" required>
                                <SelectRoot 
                                    collection={membersList} 
                                    value={[formData.member_id]}
                                    onValueChange={(e) => setFormData({...formData, member_id: e.value[0]})}
                                >
                                    <SelectTrigger>
                                        <SelectValueText placeholder="Seleccionar socio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {membersList.items.map((item) => (
                                            <SelectItem item={item} key={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </SelectRoot>
                            </Field>

                            <Field label="Monto ($)" required>
                                <Input 
                                    type="number" 
                                    value={formData.amount} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({
                                            ...formData,
                                            amount: val === '' ? '' : Number(val)
                                        });
                                    }}
                                    required
                                />
                            </Field>

                            <Stack direction="row" gap="4">
                                <Field label="Mes" required>
                                    <Input 
                                        type="number" min={1} max={12}
                                        value={formData.month} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({
                                                ...formData,
                                                month: val === '' ? '' : Number(val)
                                            });
                                        }}
                                        required
                                    />
                                </Field>
                                <Field label="Año" required>
                                    <Input 
                                        type="number" 
                                        value={formData.year} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({
                                                ...formData,
                                                year: val === '' ? '' : Number(val)
                                            });
                                        }}
                                        required
                                    />
                                </Field>
                            </Stack>

                            <Field label="Fecha de Vencimiento" required>
                                <Input 
                                    type="date" 
                                    value={formData.due_date} 
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    required
                                />
                            </Field>
                        </Stack>
                    </DialogBody>
                    <DialogFooter>
                        <DialogActionTrigger asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogActionTrigger>
                        <Button type="submit" colorPalette="blue" loading={isSubmitting}>
                            Registrar Pago
                        </Button>
                    </DialogFooter>
                    <DialogCloseTrigger />
                </form>
            </DialogContent>
        </DialogRoot>
    );
};
