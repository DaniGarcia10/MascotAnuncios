import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Criadero } from '../models/Criadero.model';

@Injectable({
  providedIn: 'root'
})
export class CriaderoService {
  private COLLECTION_NAME = 'criaderos';

  constructor(private firestore: Firestore) {}

  async getCriaderoById(id: string): Promise<Criadero | null> {
    try {
      const criaderoDocRef = doc(this.firestore, this.COLLECTION_NAME, id);
      const criaderoDocSnap = await getDoc(criaderoDocRef);

      if (criaderoDocSnap.exists()) {
        const criadero = criaderoDocSnap.data() as Criadero;
        return criadero;
      } else {
        console.warn('Criadero no encontrado');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener los datos del criadero:', error);
      throw error;
    }
  }
}
