import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Anuncio } from '../models/Anuncio.model';

@Injectable({
  providedIn: 'root'
})
export class AnunciosService {

  constructor(private firestore: Firestore, private storage: Storage) { }

  getAnuncios(): Observable<Anuncio[]> {
    const anunciosCollection = collection(this.firestore, 'anuncios');
    return collectionData(anunciosCollection, { idField: 'id' }).pipe(
      switchMap((anuncios: any[]) =>
        from(Promise.all(
          anuncios.map(async (anuncio) => {
            if (anuncio.id_imagenes && anuncio.id_imagenes.length > 0) {
              anuncio.id_imagenes = await Promise.all(
                anuncio.id_imagenes.map(async (imagenPath: string) => {
                  const imageRef = ref(this.storage, imagenPath);
                  return getDownloadURL(imageRef);
                })
              );
            }
            console.log('Datos del anuncio:', anuncio);
            return anuncio;
          })
        ))
      )
    );
  }
}
