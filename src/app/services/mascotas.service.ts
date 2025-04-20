import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Mascota } from '../models/Mascota.model';
import { ImagenService } from './imagen.service';

@Injectable({
  providedIn: 'root'
})
export class MascotasService {
  private COLLECTION_NAME = 'mascotas';

  constructor(private firestore: Firestore, private imagenService: ImagenService) {}

  async getMascotaById(id: string): Promise<Mascota | undefined> {
    const mascotaDocRef = doc(this.firestore, this.COLLECTION_NAME, id);
    const mascotaDocSnap = await getDoc(mascotaDocRef);

    if (mascotaDocSnap.exists()) {
      const mascota = mascotaDocSnap.data() as Mascota;

      // Cargar las imágenes de la mascota si existen
      if (mascota.imagenes && mascota.imagenes.length > 0) {
        console.log('Cargando imágenes para la mascota:', mascota.nombre);
        mascota.imagenes = await this.imagenService.cargarImagenes(mascota.imagenes);
      }

      return mascota;
    } else {
      console.warn('Mascota no encontrada');
      return undefined;
    }
  }

  getMascotas(): Observable<Mascota[]> {
    const mascotasCollection = collection(this.firestore, this.COLLECTION_NAME);
    return collectionData(mascotasCollection, { idField: 'id' }) as Observable<Mascota[]>;
  }
}