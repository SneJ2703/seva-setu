'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';

export function useWorkers() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const workersRef = ref(database, 'workers');

        const unsubscribe = onValue(
            workersRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const workersList = Object.entries(data).map(([key, value]) => ({
                        ...value,
                        id: key,
                    }));
                    setWorkers(workersList);
                } else {
                    setWorkers([]);
                }
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const getWorkersByStatus = (status) => {
        return workers.filter((w) => w.status === status);
    };

    const getWorkersByDepartment = (department) => {
        return workers.filter((w) => w.department === department);
    };

    return {
        workers,
        loading,
        error,
        getWorkersByStatus,
        getWorkersByDepartment,
    };
}