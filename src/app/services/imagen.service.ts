import { Injectable } from '@angular/core';
import { ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Storage } from '@angular/fire/storage';
import { push, child, Database, ref as dbRef } from '@angular/fire/database';
import { listAll } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {

  constructor(private storage: Storage, private database: Database) { }

  async obtenerUrlImagen(ruta: string): Promise<string> {
    const imageRef = ref(this.storage, ruta);
    return await getDownloadURL(imageRef);
  }
  

  async cargarImagenes(imagenPaths: string[]): Promise<string[]> {
    return Promise.all(
      imagenPaths.map(async (imagenPath: string) => {
        const imageRef = ref(this.storage, imagenPath);
        return getDownloadURL(imageRef);
      })
    );
  }

  private validarExtension(file: File): string {
    if (!(file instanceof File)) {
      throw new Error('El archivo proporcionado no es válido.');
    }
    const extension = file.name.split('.').pop()?.toLowerCase();
    const extensionesValidas = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    if (!extension || !extensionesValidas.includes(extension)) {
      throw new Error('Formato de imagen no compatible.');
    }
    return extension;
  }

  async subirImagen(
    file: File,
    tipo: 'usuario' | 'criadero' | 'anuncio' | 'mascota' | 'cachorro' | 'documentacion',
    id: string
  ): Promise<string> {
    const extension = this.validarExtension(file);
    let ruta: string;
    let nombreArchivo: string;

    // Generar un ID único con Firebase
    const uniqueIdRef = push(child(dbRef(this.database), 'unique-ids'));
    const uniqueId = uniqueIdRef.key;

    if (!uniqueId) {
      throw new Error('No se pudo generar un ID único.');
    }

    if (tipo === 'usuario') {
      nombreArchivo = `${id}.${extension}`;
      ruta = `usuarios/${nombreArchivo}`;
    } else if (tipo === 'criadero') {
      nombreArchivo = `${id}.${extension}`;
      ruta = `criaderos/${nombreArchivo}`;
    } else if (tipo === 'anuncio') {
      nombreArchivo = `${uniqueId}.${extension}`;
      ruta = `anuncios/${id}/${nombreArchivo}`;
    } else if (tipo === 'mascota') {
      nombreArchivo = `${uniqueId}.${extension}`;
      ruta = `mascotas/${id}/${nombreArchivo}`;
    } else if (tipo === 'cachorro') {
      nombreArchivo = `${uniqueId}.${extension}`;
      ruta = `cachorros/${id}/${nombreArchivo}`;
    } else if (tipo === 'documentacion') {
      nombreArchivo = `${uniqueId}.${extension}`;
      ruta = `documentacion/${id}/${nombreArchivo}`;
    } else {
      throw new Error('Tipo de imagen no válido.');
    }

    const storageRef = ref(this.storage, ruta);
    await uploadBytes(storageRef, file);

    console.log(`Imagen subida: ${ruta}`);

    return nombreArchivo;
  }

  async eliminarImagenes(
    tipo: 'usuario' | 'criadero' | 'anuncio' | 'mascota' | 'cachorro',
    id: string,
    imagenes: string[]
  ): Promise<void> {
    let rutaBase: string;
  
    if (tipo === 'usuario') {
      rutaBase = 'usuarios';
    } else if (tipo === 'criadero') {
      rutaBase = 'criaderos';
    } else if (tipo === 'anuncio') {
      rutaBase = `anuncios/${id}`;
    } else if (tipo === 'mascota') {
      rutaBase = `mascotas/${id}`;
    } else if (tipo === 'cachorro') {
      rutaBase = `cachorros/${id}`;
    } else {
      throw new Error('Tipo de imagen no válido.');
    }
  
    for (const imagen of imagenes) {
      const nombre = imagen.startsWith('http')
        ? decodeURIComponent(imagen.split('/').pop()?.split('?')[0] ?? '')
        : imagen;
  
      const rutaCompleta = `${rutaBase}/${nombre}`;
      const storageRef = ref(this.storage, rutaCompleta);
  
      try {
        await deleteObject(storageRef);
        console.log(`Imagen eliminada: ${rutaCompleta}`);
      } catch (error) {
        console.error(`Error al eliminar la imagen ${rutaCompleta}:`, error);
      }
    }
  } 

  async eliminarCarpeta(
    tipo: 'anuncio' | 'cachorro',
    id: string
  ): Promise<void> {
    const folderRef = ref(this.storage, `${tipo}s/${id}/`);
  
    try {
      const listado = await listAll(folderRef);
      const eliminaciones = listado.items.map((item) => deleteObject(item));
      await Promise.all(eliminaciones);
      console.log(`Carpeta ${tipo}s/${id} eliminada con éxito.`);
    } catch (error: any) {
      if (error.code !== 'storage/object-not-found') {
        console.error(`Error al eliminar carpeta ${tipo}s/${id}:`, error);
      } else {
        console.warn(`Nada que borrar en ${tipo}s/${id}`);
      }
    }
  }
  

}
