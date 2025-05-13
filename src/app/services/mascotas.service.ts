import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Mascota } from '../models/Mascota.model';
import { ImagenService } from './imagen.service';
import { Auth } from '@angular/fire/auth'; // Importar el servicio de autenticación

@Injectable({
  providedIn: 'root'
})
export class MascotasService {
  private COLLECTION_NAME = 'mascotas';

  constructor(private firestore: Firestore, private imagenService: ImagenService, private auth: Auth) {}

  async getMascotaById(id: string): Promise<Mascota | undefined> {
    const mascotaDocRef = doc(this.firestore, this.COLLECTION_NAME, id);
    const mascotaDocSnap = await getDoc(mascotaDocRef);

    if (mascotaDocSnap.exists()) {
      const mascota = mascotaDocSnap.data() as Mascota;

      // Obtener el uid del usuario autenticado
      const user = this.auth.currentUser;
      if (!user) {
        console.warn('Usuario no autenticado');
        return undefined;
      }

      // Cargar las imágenes de la mascota si existen
      if (mascota.imagenes && mascota.imagenes.length > 0) {
        console.log('Cargando imágenes para la mascota:', mascota.nombre);
        const imagenesConRuta = mascota.imagenes.map(img => `mascotas/${user.uid}/${img}`);
        mascota.imagenes = await this.imagenService.cargarImagenes(imagenesConRuta);
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