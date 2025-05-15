import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, deleteDoc, addDoc, updateDoc, query, where } from '@angular/fire/firestore';
import { Storage, ref, deleteObject } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Anuncio } from '../models/Anuncio.model';
import { ImagenService } from './imagen.service';
import { CachorrosService } from './cachorros.service';

@Injectable({
  providedIn: 'root'
})
export class AnunciosService {

  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private imagenService: ImagenService,
    private cachorrosService: CachorrosService 
  ) { }

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
              // Actualizar las rutas de las imágenes con el nuevo formato
              const imagenesConRuta = anuncio.imagenes.map((img: string) =>
                img.startsWith('http') ? img : `anuncios/${anuncio.id}/${img}`
              );
              anuncio.imagenes = await this.imagenService.cargarImagenes(imagenesConRuta);
            }
            return anuncio;
          })
        ))
      )
    );
  }

  getAnunciosPorUsuario(usuarioId: string): Observable<Anuncio[]> {
    const anunciosCollection = collection(this.firestore, 'anuncios');
    const anunciosQuery = query(anunciosCollection, where('id_usuario', '==', usuarioId));
    return collectionData(anunciosQuery, { idField: 'id' }).pipe(
      switchMap((anuncios: any[]) =>
        from(Promise.all(
          anuncios.map(async (anuncio) => {
            if (anuncio.fecha_publicacion) {
              anuncio.fecha_publicacion = new Date(anuncio.fecha_publicacion);
            }
            if (anuncio.imagenes && anuncio.imagenes.length > 0) {
              const imagenesConRuta = anuncio.imagenes.map((img: string) =>
                img.startsWith('http') ? img : `anuncios/${anuncio.id}/${img}`
              );
              anuncio.imagenes = await this.imagenService.cargarImagenes(imagenesConRuta);
            }
            return anuncio;
          })
        ))
      )
    );
  }

  eliminarAnuncio(id: string): Observable<void> {
    const anuncioRef = doc(this.firestore, `anuncios/${id}`);
  
    return from(this.cachorrosService.getCachorrosByAnuncioId(id)).pipe(
      switchMap(async (cachorros) => {
        // Eliminar carpeta de imágenes de cachorros
        await this.imagenService.eliminarCarpeta('cachorro', id);
  
        // Eliminar documentos de cachorros
        for (const cachorro of cachorros) {
          const cachorroRef = doc(this.firestore, `cachorros/${cachorro.id}`);
          await deleteDoc(cachorroRef);
        }
      }),
      switchMap(() =>
        // Eliminar carpeta de imágenes del anuncio
        from(this.imagenService.eliminarCarpeta('anuncio', id))
      ),
      switchMap(() =>
        // Eliminar el documento del anuncio
        from(deleteDoc(anuncioRef))
      )
    );
  }
  

  async subirAnuncio(anuncioData: any): Promise<void> {
    // Concatenar edadValor y edadUnidad en el campo edad
    anuncioData.edad = `${anuncioData.edadValor} ${anuncioData.edadUnidad}`;
    delete anuncioData.edadValor;
    delete anuncioData.edadUnidad;

    const imagenesAnuncio = anuncioData.imagenes as File[];
    const cachorrosData = anuncioData.cachorros || [];
    delete anuncioData.cachorros;
    delete anuncioData.imagenes; // Eliminar el campo de imágenes antes de guardar

    // Subir el anuncio sin las imágenes inicialmente
    const anunciosRef = collection(this.firestore, 'anuncios');
    const anuncioDocRef = await addDoc(anunciosRef, anuncioData);
    const id_anuncio = anuncioDocRef.id;

    // Subir imágenes del anuncio y actualizar el documento con las URLs
    const imagenesAnuncioUrls = await Promise.all(
      imagenesAnuncio.map(async (file) => {
        return await this.imagenService.subirImagen(file, 'anuncio', id_anuncio);
      })
    );
    await updateDoc(anuncioDocRef, { imagenes: imagenesAnuncioUrls });

    // Subir datos de cachorros si existen
    for (const cachorro of cachorrosData) {
      const imagenesCachorro = cachorro.imagenes as File[];
      delete cachorro.imagenes; // Eliminar el campo de imágenes antes de guardar

      const imagenesCachorroUrls = await Promise.all(
        imagenesCachorro.map(async (file) => {
          return await this.imagenService.subirImagen(file, 'cachorro', id_anuncio);
        })
      );
      cachorro.imagenes = imagenesCachorroUrls;

      const cachorrosRef = collection(this.firestore, 'cachorros');
      await addDoc(cachorrosRef, { ...cachorro, id_anuncio });
    }
  }
}
