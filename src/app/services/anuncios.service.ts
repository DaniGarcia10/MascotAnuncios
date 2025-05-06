import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, deleteDoc } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
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
            if (anuncio.imagenes && anuncio.imagenes.length > 0) {
              // Agregar el prefijo 'anuncios/' si no es una URL completa
              const imagenesConRuta = anuncio.imagenes.map((img: string) =>
                img.startsWith('http') ? img : `anuncios/${img}`
              );
              anuncio.imagenes = await this.imagenService.cargarImagenes(imagenesConRuta);
            }
            console.log('Datos del anuncio:', anuncio);
            return anuncio;
          })
        ))
      )
    );
  }

  eliminarAnuncio(id: string): Observable<void> {
    const anuncioRef = doc(this.firestore, `anuncios/${id}`);
    return from(deleteDoc(anuncioRef));
  }
  

}
