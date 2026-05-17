import { useEffect, useState } from 'react';
import type { LockerDTO } from '@alentapp/shared';
import { lockersService } from '../services/lockers';

export function useLockers() {
    const [lockers, setLockers] = useState<LockerDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLockers = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await lockersService.getAll();
            setLockers(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar los lockers');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLockers();
    }, []);

    return {
        lockers,
        isLoading,
        error,
        fetchLockers,
    };
}