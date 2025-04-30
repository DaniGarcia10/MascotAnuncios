import { Injectable } from '@angular/core';
import { ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {

  constructor(private storage: Storage) { }

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
  
    if (tipo === 'usuario') {
      nombreArchivo = `${id}.${extension}`;
      ruta = `usuarios/${nombreArchivo}`;
    } else if (tipo === 'criadero') {
      nombreArchivo = `${id}.${extension}`;
      ruta = `criaderos/${nombreArchivo}`;
    } else if (tipo === 'anuncio') {
      nombreArchivo = `${uuidv4()}.${extension}`;
      ruta = `anuncios/${id}/${nombreArchivo}`;
    } else if (tipo === 'mascota') {
      nombreArchivo = `${uuidv4()}.${extension}`;
      ruta = `mascotas/${id}/${nombreArchivo}`;
    } else if (tipo === 'cachorro') {
      nombreArchivo = `${uuidv4()}.${extension}`;
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
