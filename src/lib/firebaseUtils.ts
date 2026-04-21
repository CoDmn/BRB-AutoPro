import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export async function submitContactRequest(data: any) {
  const newRef = doc(collection(db, 'contactRequests'));
  await setDoc(newRef, {
    ...data,
    status: 'new',
    createdAt: serverTimestamp()
  });
}

export async function submitImportRequest(data: any) {
  const newRef = doc(collection(db, 'importRequests'));
  await setDoc(newRef, {
    ...data,
    status: 'new',
    createdAt: serverTimestamp()
  });
}

export async function submitEstimationRequest(data: any) {
  const newRef = doc(collection(db, 'estimationRequests'));
  await setDoc(newRef, {
    ...data,
    status: 'new',
    createdAt: serverTimestamp()
  });
}

export async function addInventoryItem(data: any) {
  const newRef = doc(collection(db, 'inventory'));
  await setDoc(newRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function deleteInventoryItem(id: string) {
  await deleteDoc(doc(db, 'inventory', id));
}

export async function updateInventoryItem(id: string, data: any) {
  const ref = doc(db, 'inventory', id);
  await setDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function toggleInventoryFavorite(id: string, isFavorite: boolean) {
  const ref = doc(db, 'inventory', id);
  await setDoc(ref, { isFavorite }, { merge: true });
}

export async function addDetailingGallery(data: any) {
  const newRef = doc(collection(db, 'detailingGalleries'));
  await setDoc(newRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateDetailingGallery(id: string, data: any) {
  const ref = doc(db, 'detailingGalleries', id);
  await setDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function toggleDetailingFavorite(id: string, isFavorite: boolean) {
  const ref = doc(db, 'detailingGalleries', id);
  await setDoc(ref, { isFavorite }, { merge: true });
}

export async function deleteDetailingGallery(id: string) {
  await deleteDoc(doc(db, 'detailingGalleries', id));
}

export async function submitBooking(data: any) {
  const newRef = doc(collection(db, 'bookings'));
  await setDoc(newRef, {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateBookingStatus(id: string, status: 'accepted' | 'refused') {
  const ref = doc(db, 'bookings', id);
  await setDoc(ref, {
    status,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
