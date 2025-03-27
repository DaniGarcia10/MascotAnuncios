import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc } from '@angular/fire/firestore';
import { Cachorro } from '../models/Cachorro.model';

@Injectable({
  providedIn: 'root'
})
export class CachorrosService {

  constructor(private firestore: Firestore) { }

  async getCachorrosByIds(ids: string[]): Promise<Cachorro[]> {
    const cachorros: Cachorro[] = [];
    for (const id of ids) {
      const docRef = doc(this.firestore, 'cachorros', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        cachorros.push(docSnap.data() as Cachorro);
      }
    }
    return cachorros;
  }
}
