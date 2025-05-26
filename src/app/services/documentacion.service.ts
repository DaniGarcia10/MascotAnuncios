import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DocumentacionService {
  private COLLECTION_NAME = "documentacion";

  constructor(
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

  getComprobarEstadoById(userId: string): Promise<boolean> {
    return this.obtenerDocumentacion(userId).then(data => {
      if (data && data.estado) {
        if (data.estado === 'ACEPTADO') {
          return true;
        }
      }
      return false;
    });
  }
}
