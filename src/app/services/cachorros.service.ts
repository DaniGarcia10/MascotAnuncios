import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, query, where, getDocs, updateDoc } from '@angular/fire/firestore';
import { Cachorro } from '../models/Cachorro.model';

@Injectable({
  providedIn: 'root'
})
export class CachorrosService {

  constructor(private firestore: Firestore) { }

  async getCachorrosByAnuncioId(idAnuncio: string): Promise<Cachorro[]> {
    const cachorros: Cachorro[] = [];
    const cachorrosCollection = collection(this.firestore, 'cachorros');
    const q = query(cachorrosCollection, where('id_anuncio', '==', idAnuncio));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(doc => {
      cachorros.push({ ...doc.data(), id: doc.id } as Cachorro);
    });

    return cachorros;
  }

  async actualizarDisponibilidad(idCachorro: string, disponible: boolean): Promise<void> {
    const cachorroDoc = doc(this.firestore, 'cachorros', idCachorro);
    await updateDoc(cachorroDoc, { disponible });
  }
}
