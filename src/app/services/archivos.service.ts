import { Injectable } from '@angular/core';
import { Storage, ref, listAll, getDownloadURL, uploadBytes, deleteObject } from '@angular/fire/storage';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../models/Usuario.model';
import { DocumentacionService } from './documentacion.service'; // Importa el servicio
import { push, child, Database, ref as dbRef } from '@angular/fire/database';
import { CriaderoService } from './criadero.service'; // Asegúrate de importar el servicio

@Injectable({
  providedIn: 'root'
})
export class ArchivosService {
  constructor(
    private storage: Storage,
    private database: Database,
    private usuarioService: UsuarioService,
    private documentacionService: DocumentacionService,
    private criaderoService: CriaderoService // Inyecta el servicio
  ) {}


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

  async listarArchivosUsuario(userId: string) {
    const testRef = ref(this.storage, `documentacion/${userId}/`);
    const testArchivos = await listAll(testRef);
    console.log('Archivos directos en la carpeta del usuario:', testArchivos.items.map(a => a.name));
  }

  async subirDocumentacion(
    file: File,
    tipo: 'dni' | 'nz',
    id: string
  ): Promise<string> {
    const extension = this.validarExtensionDocumentos(file);
    let ruta: string;
    let nombreArchivo: string;

    if (tipo === 'dni') {
      nombreArchivo = `dni.${extension}`;
      ruta = `documentacion/${id}/${nombreArchivo}`;
    } else if (tipo === 'nz') {
      nombreArchivo = `nucleo_zoologico.${extension}`;
      ruta = `documentacion/${id}/${nombreArchivo}`;
    } else {
      throw new Error('Tipo de documento no válido.');
    }

    const storageRef = ref(this.storage, ruta);
    await uploadBytes(storageRef, file);

    console.log(`Documento subido: ${ruta}`);

    return nombreArchivo;
  }

  private validarExtensionDocumentos(file: File): string {
    if (!(file instanceof File)) {
      throw new Error('El archivo proporcionado no es válido.');
    }
    const extension = file.name.split('.').pop()?.toLowerCase();
    const extensionesValidas = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    if (!extension || !extensionesValidas.includes(extension)) {
      throw new Error('Formato de documento no compatible.');
    }
    return extension;
  }

  async getUsuariosConDocumentosYCriadero(): Promise<{
    usuario: Usuario,
    archivos: { nombre: string, url: string }[],
    documentacion: any,
    criadero: any
  }[]> {
    const docRef = ref(this.storage, 'documentacion/');
    const carpetas = await listAll(docRef);
    console.log('Carpetas encontradas:', carpetas.prefixes.map(c => c.name));
    const usuarios = await Promise.all(
      carpetas.prefixes.map(async carpetaRef => {
        const userId = carpetaRef.name;
        const usuarioObj = await this.usuarioService.getUsuarioById(userId);
        const documentacion = await this.documentacionService.obtenerDocumentacion(userId);

        const archivos = await listAll(carpetaRef);

        if (usuarioObj && archivos.items.length > 0) {
          // Obtener el criadero usando el id_criadero del usuario
          let criadero = null;
          if (usuarioObj.id_criadero) {
            criadero = await this.criaderoService.getCriaderoById(usuarioObj.id_criadero);
          }
          const archivosArr = await Promise.all(
            archivos.items.map(async archivoRef => ({
              nombre: archivoRef.name,
              url: await getDownloadURL(archivoRef)
            }))
          );
          return { usuario: usuarioObj, archivos: archivosArr, documentacion, criadero };
        }
        return null;
      })
    );
    const resultado = usuarios.filter(u => u !== null) as {
      usuario: Usuario,
      archivos: { nombre: string, url: string }[],
      documentacion: any,
      criadero: any
    }[];
    return resultado;
  }
}
