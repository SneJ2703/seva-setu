"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

export default function TestFirebasePage() {
    const [status, setStatus] = useState("Testing connection...");
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        testConnection();
    }, []);

    async function testConnection() {
        try {
            // Try to add a test document
            const testCollection = collection(db, "connection_test");
            const docRef = await addDoc(testCollection, {
                message: "Firebase connection test",
                timestamp: serverTimestamp(),
                testId: Date.now()
            });

            setStatus(`✅ Connected! Test document created with ID: ${docRef.id}`);

            // Fetch all documents from the test collection
            const querySnapshot = await getDocs(testCollection);
            const docs = [];
            querySnapshot.forEach((doc) => {
                docs.push({ id: doc.id, ...doc.data() });
            });
            setDocuments(docs);

        } catch (err) {
            setError(err.message);
            setStatus("❌ Connection failed");
            console.error("Firebase connection error:", err);
        }
    }

    return (
        <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
            <h1>Firebase Connection Test</h1>

            <div style={{
                padding: "1rem",
                marginTop: "1rem",
                backgroundColor: error ? "#fee" : "#efe",
                borderRadius: "8px",
                border: `1px solid ${error ? "#f88" : "#8f8"}`
            }}>
                <strong>Status:</strong> {status}
            </div>

            {error && (
                <div style={{
                    padding: "1rem",
                    marginTop: "1rem",
                    backgroundColor: "#fee",
                    borderRadius: "8px",
                    border: "1px solid #f88"
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {documents.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                    <h2>Test Documents in Firestore:</h2>
                    <ul>
                        {documents.map((doc) => (
                            <li key={doc.id}>
                                <strong>{doc.id}</strong>: {doc.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                onClick={testConnection}
                style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    backgroundColor: "#0070f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                Test Again
            </button>
        </div>
    );
}