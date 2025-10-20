import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';

const CHATS_COLLECTION = 'consultationChats';
const chatsRef = collection(db, CHATS_COLLECTION);

function normaliseTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  return value;
}

export async function ensureConsultationChat({
  consultationId,
  userId,
  consultantId,
  clientName,
  consultantName
}) {
  if (!consultationId || !userId || !consultantId) {
    throw new Error('Missing identifiers for consultation chat.');
  }

  const chatRef = doc(db, CHATS_COLLECTION, consultationId);
  const snapshot = await getDoc(chatRef);

  if (!snapshot.exists()) {
    const now = serverTimestamp();
    await setDoc(chatRef, {
      consultationId,
      participants: [userId, consultantId],
      participantMetadata: {
        [userId]: {
          role: 'client',
          name: clientName || 'Client'
        },
        [consultantId]: {
          role: 'consultant',
          name: consultantName || 'Consultant'
        }
      },
      createdAt: now,
      updatedAt: now,
      lastMessage: null,
      lastMessageAt: null,
      lastSenderId: null
    });
  } else {
    const existing = snapshot.data();
    const updates = {};
    const participants = Array.isArray(existing.participants) ? existing.participants : [];
    let needsUpdate = false;

    if (!participants.includes(userId) || !participants.includes(consultantId)) {
      updates.participants = Array.from(new Set([...participants, userId, consultantId]));
      needsUpdate = true;
    }

    const currentMetadata = existing.participantMetadata || {};
    if (!currentMetadata[userId]?.name && clientName) {
      updates[`participantMetadata.${userId}`] = {
        role: 'client',
        name: clientName
      };
      needsUpdate = true;
    }
    if (!currentMetadata[consultantId]?.name && consultantName) {
      updates[`participantMetadata.${consultantId}`] = {
        role: 'consultant',
        name: consultantName
      };
      needsUpdate = true;
    }

    if (needsUpdate) {
      updates.updatedAt = serverTimestamp();
      await updateDoc(chatRef, updates);
    }
  }

  return { id: chatRef.id };
}

export function listenToUserChats(userId, onChange, onError) {
  if (!userId) {
    if (onChange) {
      onChange([]);
    }
    return () => {};
  }

  const chatsQuery = query(chatsRef, where('participants', 'array-contains', userId));

  return onSnapshot(
    chatsQuery,
    (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          createdAt: normaliseTimestamp(data.createdAt),
          updatedAt: normaliseTimestamp(data.updatedAt),
          lastMessageAt: normaliseTimestamp(data.lastMessageAt)
        };
      });
      items.sort((a, b) => {
        const valueA = a.lastMessageAt || a.updatedAt || 0;
        const valueB = b.lastMessageAt || b.updatedAt || 0;
        return valueB - valueA;
      });
      if (onChange) {
        onChange(items);
      }
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
}

export function listenToChatMessages(chatId, onChange, onError) {
  if (!chatId) {
    if (onChange) {
      onChange([]);
    }
    return () => {};
  }

  const messagesRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
  const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          createdAt: normaliseTimestamp(data.createdAt)
        };
      });
      if (onChange) {
        onChange(messages);
      }
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
}

export async function sendChatMessage(chatId, { text, senderId, attachments = [] }) {
  const trimmed = (text || '').trim();
  if (!chatId || !trimmed || !senderId) {
    return null;
  }

  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  const messagesRef = collection(chatRef, 'messages');
  const timestamp = serverTimestamp();

  const messagePayload = {
    text: trimmed,
    senderId,
    attachments,
    createdAt: timestamp
  };

  const docRef = await addDoc(messagesRef, messagePayload);

  await updateDoc(chatRef, {
    lastMessage: trimmed,
    lastMessageAt: timestamp,
    lastSenderId: senderId,
    updatedAt: timestamp
  });

  return docRef.id;
}
