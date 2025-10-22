import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Create a new booking in Firestore
 * @param {Object} bookingData
 */
export const createBooking = async (bookingData) => {
  if (!bookingData) throw new Error('No booking data provided');

  const bookingRef = collection(db, 'bookings'); // collection name
  const payload = {
    ...bookingData,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(bookingRef, payload);
  return docRef.id;
};
