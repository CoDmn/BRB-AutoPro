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

export async function addDetailingGallery(data: any) {
  const newRef = doc(collection(db, 'detailingGalleries'));
  await setDoc(newRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function deleteDetailingGallery(id: string) {
  await deleteDoc(doc(db, 'detailingGalleries', id));
}
