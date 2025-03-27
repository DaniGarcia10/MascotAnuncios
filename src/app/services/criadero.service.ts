import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Criadero } from '../models/Criadero.model';
import { ImagenService } from './imagen.service';

@Injectable({
  providedIn: 'root'
})
export class CriaderoService {
  private COLLECTION_NAME = 'criaderos';

  constructor(private firestore: Firestore, private imagenService: ImagenService) {}

  async getCriaderoById(id: string): Promise<Criadero | undefined> {
    const criaderoDocRef = doc(this.firestore, this.COLLECTION_NAME, id);
    const criaderoDocSnap = await getDoc(criaderoDocRef);

    if (criaderoDocSnap.exists()) {
      const criadero = criaderoDocSnap.data() as Criadero;

      // Cargar la imagen del criadero si existe
      if (criadero.foto_perfil) {
        criadero.foto_perfil = await this.imagenService.cargarImagenes([criadero.foto_perfil]).then(urls => urls[0]);
      }

      return criadero;
    } else {
      console.warn('Criadero no encontrado');
      return undefined;
    }
  }
}
