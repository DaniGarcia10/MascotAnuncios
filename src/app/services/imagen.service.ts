import { Injectable } from '@angular/core';
import { ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Storage } from '@angular/fire/storage';
import { push, child, Database, ref as dbRef } from '@angular/fire/database';

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
    const extensionesValidas = ['jpg', 'jpeg', 'png', 'webp'];
    if (!extension || !extensionesValidas.includes(extension)) {
      throw new Error('Formato de imagen no compatible.');
    }
    return extension;
  }

  async subirImagen(
    file: File,
    tipo: 'usuario' | 'criadero' | 'anuncio' | 'mascota' | 'cachorro',
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
    } else {
      throw new Error('Tipo de imagen no válido.');
    }

    const storageRef = ref(this.storage, ruta);
    await uploadBytes(storageRef, file);

    console.log(`Imagen subida: ${ruta}`);

    return nombreArchivo;
  }

}
