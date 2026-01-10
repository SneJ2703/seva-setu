'use client';

import { useEffect, useState } from 'react';
import { ref, onValue, push, set, update } from 'firebase/database';
import { database } from '@/lib/firebase';

export function useIssues() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const issuesRef = ref(database, 'issues');

        // Real-time listener
        const unsubscribe = onValue(
            issuesRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const issuesList = Object.entries(data).map(([key, value]) => ({
                        ...value,
                        id: key,
                    }));
                    setIssues(issuesList);
                } else {
                    setIssues([]);
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

    // Add new issue
    const addIssue = async (issueData) => {
        try {
            const issuesRef = ref(database, 'issues');
            const newIssueRef = push(issuesRef);
            await set(newIssueRef, {
                ...issueData,
                createdAt: Date.now(),
                status: 'open',
            });
            return newIssueRef.key;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Update issue
    const updateIssue = async (issueId, updates) => {
        try {
            const issueRef = ref(database, `issues/${issueId}`);
            await update(issueRef, {
                ...updates,
                updatedAt: Date.now(),
            });
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Assign worker to issue
    const assignWorker = async (issueId, workerId) => {
        try {
            const issueRef = ref(database, `issues/${issueId}`);
            await update(issueRef, {
                assignedWorker: workerId,
                status: 'assigned',
                assignedAt: Date.now(),
            });
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return {
        issues,
        loading,
        error,
        addIssue,
        updateIssue,
        assignWorker,
    };
}