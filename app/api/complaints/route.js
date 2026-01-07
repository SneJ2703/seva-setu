import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req) {
    try {
        const { title, description, location, category, images } = await req.json();

        const docRef = await addDoc(collection(db, 'complaints'), {
            title,
            description,
            location,
            category,
            images,
            status: 'pending',
            priority: 'low',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return Response.json({ id: docRef.id, success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}