import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, collection, collectionData, query, where, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Mascota } from '../models/Mascota.model';
import { ArchivosService } from './archivos.service';
import { Auth } from '@angular/fire/auth'; 

@Injectable({
  providedIn: 'root'
})
export class MascotasService {
  private COLLECTION_NAME = 'mascotas';

  constructor(private firestore: Firestore, private archivosService: ArchivosService, private auth: Auth) {}

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
        mascota.imagenes = await this.archivosService.cargarImagenes(imagenesConRuta);
      }

      return mascota;
    } else {
      console.warn('Mascota no encontrada');
      return undefined;
    }
  }

  /**
   * Obtiene una mascota por su ID y el ID del usuario propietario (para anuncios).
   * @param id ID de la mascota
   * @param idUsuario ID del usuario propietario de la mascota
   */
  async getMascotaByIdAndUsuario(id: string, idUsuario: string): Promise<Mascota | undefined> {
    const mascotaDocRef = doc(this.firestore, this.COLLECTION_NAME, id);
    const mascotaDocSnap = await getDoc(mascotaDocRef);

    if (mascotaDocSnap.exists()) {
      const mascota = mascotaDocSnap.data() as Mascota;

      // Cargar las imágenes de la mascota usando el idUsuario proporcionado
      if (mascota.imagenes && mascota.imagenes.length > 0) {
        const imagenesConRuta = mascota.imagenes.map(img => `mascotas/${idUsuario}/${img}`);
        mascota.imagenes = await this.archivosService.cargarImagenes(imagenesConRuta);
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

  /**
   * Obtiene todas las mascotas de un usuario por su ID.
   * @param idUsuario ID del usuario propietario de las mascotas
   */
  async getMascotasByUsuarioId(idUsuario: string): Promise<Mascota[]> {
    const mascotasCollection = collection(this.firestore, this.COLLECTION_NAME);
    const q = query(mascotasCollection, where('id_usuario', '==', idUsuario));
    const querySnapshot = await getDocs(q);

    const mascotas: Mascota[] = [];
    for (const docSnap of querySnapshot.docs) {
      const mascota = docSnap.data() as Mascota;
      mascota.id = docSnap.id;
      // Cargar imágenes si existen
      if (mascota.imagenes && mascota.imagenes.length > 0) {
        const imagenesConRuta = mascota.imagenes.map(img => `mascotas/${idUsuario}/${img}`);
        mascota.imagenes = await this.archivosService.cargarImagenes(imagenesConRuta);
      }
      mascotas.push(mascota);
    }
    return mascotas;
  }
}