import { db } from './firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

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
