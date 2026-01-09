import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function uploadIssueImage(issueId, file) {
    try {
        // Create a reference to the file
        const fileRef = ref(storage, `issues/${issueId}/${file.name}`);

        // Upload the file
        const snapshot = await uploadBytes(fileRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}