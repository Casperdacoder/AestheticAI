import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'consultations';
const consultationsRef = collection(db, COLLECTION_NAME);

function normaliseTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  return value;
}

export function listenToConsultations(onChange, onError) {
  const consultationsQuery = query(consultationsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    consultationsQuery,
    (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          createdAt: normaliseTimestamp(data.createdAt),
          updatedAt: normaliseTimestamp(data.updatedAt)
        };
      });

      onChange(items);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
}

export async function createConsultationRequest(payload) {
  const now = serverTimestamp();
  await addDoc(consultationsRef, {
    status: 'Pending',
    ...payload,
    createdAt: now,
    updatedAt: now
  });
}

export async function updateConsultationStatus(id, status, metadata = {}) {
  const consultationDoc = doc(db, COLLECTION_NAME, id);

  await updateDoc(consultationDoc, {
    status,
    updatedAt: serverTimestamp(),
    ...metadata
  });
}