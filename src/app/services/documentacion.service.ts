import { Injectable } from '@angular/core';
import { Database } from '@angular/fire/database';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DocumentacionService {
  private COLLECTION_NAME = "documentacion";

  constructor(
    private database: Database,
    private firestore: Firestore
  ) {}

  async guardarDocumentacion(userId: string, data: any): Promise<void> {
    const userDocRef = doc(this.firestore, this.COLLECTION_NAME, userId);
    await setDoc(userDocRef, data);
  }

  async obtenerDocumentacion(userId: string): Promise<any | null> {
    const userDocRef = doc(this.firestore, this.COLLECTION_NAME, userId);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() ? userDocSnap.data() : null;
  }
}
