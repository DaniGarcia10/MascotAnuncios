import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Anuncio } from '../models/Anuncio.model';
import { ImagenService } from './imagen.service';

@Injectable({
  providedIn: 'root'
})
export class AnunciosService {

  constructor(private firestore: Firestore, private storage: Storage, private imagenService: ImagenService) { }

  getAnuncios(): Observable<Anuncio[]> {
    const anunciosCollection = collection(this.firestore, 'anuncios');
    return collectionData(anunciosCollection, { idField: 'id' }).pipe(
      switchMap((anuncios: any[]) =>
        from(Promise.all(
          anuncios.map(async (anuncio) => {
            if (anuncio.fecha_publicacion) {
              anuncio.fecha_publicacion = new Date(anuncio.fecha_publicacion);
            }
            if (anuncio.imagenes && anuncio.imagenes.length > 0) { // Cambiado de id_imagenes a imagenes
              anuncio.imagenes = await this.imagenService.cargarImagenes(anuncio.imagenes);
            }
            console.log('Datos del anuncio:', anuncio);
            return anuncio;
          })
        ))
      )
    );
  }
}
