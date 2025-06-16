import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, deleteDoc, addDoc, updateDoc, query, where } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Anuncio } from '../models/Anuncio.model';
import { ArchivosService } from './archivos.service';
import { CachorrosService } from './cachorros.service';

@Injectable({
  providedIn: 'root'
})
export class AnunciosService {

  tipos = [
    { label: 'Perro', value: true },
    { label: 'Gato', value: false }
  ];

  constructor(
    private firestore: Firestore,
    private archivosService: ArchivosService,
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
              anuncio.imagenes = await this.archivosService.cargarImagenes(imagenesConRuta);
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
              anuncio.imagenes = await this.archivosService.cargarImagenes(imagenesConRuta);
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
        await this.archivosService.eliminarCarpeta('cachorro', id);

        // Eliminar documentos de cachorros
        for (const cachorro of cachorros) {
          const cachorroRef = doc(this.firestore, `cachorros/${cachorro.id}`);
          await deleteDoc(cachorroRef);
        }
      }),
      switchMap(() =>
        // Eliminar carpeta de imágenes del anuncio
        from(this.archivosService.eliminarCarpeta('anuncio', id))
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
        return await this.archivosService.subirImagen(file, 'anuncio', id_anuncio);
      })
    );
    await updateDoc(anuncioDocRef, { imagenes: imagenesAnuncioUrls });

    // Subir datos de cachorros si existen
    for (const cachorro of cachorrosData) {
      const imagenesCachorro = cachorro.imagenes as File[];
      delete cachorro.imagenes; // Eliminar el campo de imágenes antes de guardar

      const imagenesCachorroUrls = await Promise.all(
        imagenesCachorro.map(async (file) => {
          return await this.archivosService.subirImagen(file, 'cachorro', id_anuncio);
        })
      );
      cachorro.imagenes = imagenesCachorroUrls;

      const cachorrosRef = collection(this.firestore, 'cachorros');
      await addDoc(cachorrosRef, { ...cachorro, id_anuncio });
    }
  }

  /**
   * Actualiza los campos id_padre e id_madre de un anuncio.
   * @param idAnuncio ID del anuncio
   * @param idPadre ID del padre
   * @param idMadre ID de la madre
   */
  async actualizarPadres(idAnuncio: string, idPadre: string, idMadre: string): Promise<void> {
    const anuncioDocRef = doc(this.firestore, 'anuncios', idAnuncio);
    await updateDoc(anuncioDocRef, {
      id_padre: idPadre,
      id_madre: idMadre
    });
  }

  /**
   * Actualiza los datos de un anuncio.
   * @param idAnuncio ID del anuncio
   * @param data Campos a actualizar
   */
  async actualizarAnuncio(idAnuncio: string, data: any): Promise<void> {
    console.log(data);
    const anuncioDocRef = doc(this.firestore, 'anuncios', idAnuncio);
    await updateDoc(anuncioDocRef, data);
  }

  /**
   * Obtiene el teléfono del usuario por su ID.
   * @param idUsuario ID del usuario
   * @returns Promise<string | null>
   */
  getTelefonoByIdUsuario(idUsuario: string): Promise<string | null> {
    const usuarioRef = doc(this.firestore, 'usuarios', idUsuario);
    return getDoc(usuarioRef).then(usuarioSnap => {
      if (usuarioSnap.exists()) {
        const data = usuarioSnap.data() as any;
        return data.telefono || null;
      }
      return null;
    }).catch(error => {
      console.error('Error al obtener el teléfono del usuario:', error);
      return null;
    });
  }
}
