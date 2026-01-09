import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    onSnapshot,
    where,
    doc,
    updateDoc
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { uploadIssueImage } from './storage';

// --- EXAMPLE 2: Create Issue ---
export async function createIssue(issueData, imageFile, userId) {
    try {
        let imageUrl = null;
        if (imageFile) {
            const tempId = Date.now().toString();
            imageUrl = await uploadIssueImage(tempId, imageFile);
        }
        const issueRef = collection(firestore, 'issues');
        const docRef = await addDoc(issueRef, {
            title: issueData.title,
            description: issueData.description,
            category: issueData.category,
            priority: issueData.priority,
            ward: issueData.ward,
            location: issueData.location,
            address: issueData.address,
            status: 'open',
            reportedBy: {
                userId: userId,
                name: issueData.reporterName,
                email: issueData.reporterEmail,
            },
            images: imageUrl ? [imageUrl] : [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Create issue error:', error);
        throw error;
    }
}

// --- EXAMPLE 3: Fetch Issues in Real-time ---
export function subscribeToIssues(callback, filters = {}) {
    try {
        let q = collection(firestore, 'issues');

        // Apply filters dynamically
        const conditions = [];
        if (filters.priority) conditions.push(where('priority', '==', filters.priority));
        if (filters.status) conditions.push(where('status', '==', filters.status));
        if (filters.ward) conditions.push(where('ward', '==', filters.ward));

        // If the filters include a specific userId (e.g., for "My Issues" page)
        if (filters.userId) conditions.push(where('reportedBy.userId', '==', filters.userId));

        if (conditions.length > 0) {
            q = query(q, ...conditions);
        }

        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const issues = [];
            snapshot.forEach((doc) => {
                issues.push({ id: doc.id, ...doc.data() });
            });
            callback(issues);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Subscribe error:', error);
        throw error;
    }
}

// --- EXAMPLE 4: Assign Issue to Worker ---
export async function assignIssueToWorker(issueId, workerId, workerName) {
    try {
        const issueRef = doc(firestore, 'issues', issueId);
        await updateDoc(issueRef, {
            status: 'assigned',
            assignedTo: {
                workerId: workerId,
                workerName: workerName,
            },
            updatedAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error('Assign error:', error);
        throw error;
    }
}

// --- EXAMPLE 5: Update Issue Status ---
export async function updateIssueStatus(issueId, newStatus, notes = '') {
    try {
        const issueRef = doc(firestore, 'issues', issueId);
        await updateDoc(issueRef, {
            status: newStatus,
            notes: notes,
            updatedAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error('Update error:', error);
        throw error;
    }
}