import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Denuncia } from '../models/Denuncia.model';

@Injectable({
  providedIn: 'root'
})
export class DenunciasService {

  private firestore = inject(Firestore);
  private collectionName = 'denuncias';

  añadirDenuncia(denuncia: Denuncia): Promise<void> {
    const ref = collection(this.firestore, this.collectionName);
    return addDoc(ref, {
      id_usuario: denuncia.id_usuario,
      email: denuncia.email,
      id_anuncio: denuncia.id_anuncio,
      motivo: denuncia.motivo,
      revisada: denuncia.revisada
    }).then(() => {});
  }

  obtenerDenuncias(): Observable<Denuncia[]> {
    const ref = collection(this.firestore, this.collectionName);
    return collectionData(ref, { idField: 'id' }) as Observable<Denuncia[]>;
  }

  actualizarEstadoRevisada(id: string, revisada: boolean): Promise<void> {
    const ref = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(ref, { revisada });
  }
}
