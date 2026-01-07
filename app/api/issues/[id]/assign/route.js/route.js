import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(req, { params }) {
    try {
        const { workerId, workerName } = await req.json();
        const issueRef = doc(db, 'issues', params.id);

        await updateDoc(issueRef, {
            assignedTo: workerId,
            assignedToName: workerName,
            assignedAt: new Date(),
            status: 'assigned'
        });

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}