import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { environment } from '../environments/environment';

console.log('Firebase environment:', environment.firebase);
const app = initializeApp(environment.firebase);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
