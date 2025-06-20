import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, query, where, getDocs, updateDoc, deleteDoc } from '@angular/fire/firestore';
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

  async actualizarCachorro(idCachorro: string, datos: Partial<Cachorro>): Promise<void> {
    const cachorroDoc = doc(this.firestore, 'cachorros', idCachorro);
    // No guardar el id dentro del documento
    const { id, ...resto } = datos;
    await updateDoc(cachorroDoc, { ...resto });
  }

  // NUEVO MÉTODO PARA CREAR CACHORRO
  async crearCachorro(cachorro: any): Promise<string> {
    const cachorrosCollection = collection(this.firestore, 'cachorros');
    const docRef = await addDoc(cachorrosCollection, cachorro);
    return docRef.id;
  }

  async eliminarCachorro(idCachorro: string): Promise<void> {
    const cachorroDoc = doc(this.firestore, 'cachorros', idCachorro);
    await deleteDoc(cachorroDoc);
  }
}
