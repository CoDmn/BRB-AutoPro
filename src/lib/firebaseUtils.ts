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
  const newRef = doc(collection(db, 'appointments'));
  await setDoc(newRef, {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateBookingStatus(id: string, status: 'accepted' | 'refused' | 'cancelled', googleEventId?: string) {
  const ref = doc(db, 'appointments', id);
  const data: any = {
    status,
    updatedAt: serverTimestamp()
  };
  if (googleEventId) data.googleEventId = googleEventId;
  
  await setDoc(ref, data, { merge: true });
}

export async function toggleRequestReadStatus(collectionName: string, id: string, isRead: boolean) {
  const ref = doc(db, collectionName, id);
  await setDoc(ref, { isRead, updatedAt: serverTimestamp() }, { merge: true });
}

export async function toggleRequestFavorite(collectionName: string, id: string, isFavorite: boolean) {
  const ref = doc(db, collectionName, id);
  await setDoc(ref, { isFavorite, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteRequest(collectionName: string, id: string) {
  await deleteDoc(doc(db, collectionName, id));
}
