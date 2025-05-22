import { Injectable } from '@angular/core';
import { Storage, ref, listAll, getDownloadURL } from '@angular/fire/storage';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../models/Usuario.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentacionService {
  constructor(private storage: Storage, private usuarioService: UsuarioService) {}

  async getUsuariosConDocumentos(): Promise<{ usuario: Usuario, archivos: { nombre: string, url: string }[] }[]> {
    const docRef = ref(this.storage, 'documentacion/');
    console.log('Buscando carpetas en: documentacion/');
    const carpetas = await listAll(docRef);
    console.log('Carpetas encontradas:', carpetas.prefixes.map(c => c.name));
    const usuarios = await Promise.all(
      carpetas.prefixes.map(async carpetaRef => {
        const userId = carpetaRef.name;
        const usuarioObj = await this.usuarioService.getUsuarioById(userId);
        console.log('Usuario Firestore para carpeta', userId, ':', usuarioObj);

        // Llama aquí para depurar
        await this.listarArchivosUsuario(userId);

        const archivos = await listAll(carpetaRef);
        console.log(`Archivos en carpetaRef (${userId}):`, archivos.items.map(a => a.name));
        if (usuarioObj && archivos.items.length > 0) {
          const archivosArr = await Promise.all(
            archivos.items.map(async archivoRef => ({
              nombre: archivoRef.name,
              url: await getDownloadURL(archivoRef)
            }))
          );
          return { usuario: usuarioObj, archivos: archivosArr };
        }
        return null;
      })
    );
    const resultado = usuarios.filter(u => u !== null) as { usuario: Usuario, archivos: { nombre: string, url: string }[] }[];
    console.log('Usuarios con documentos:', resultado);
    return resultado;
  }

  async listarArchivosUsuario(userId: string) {
    const testRef = ref(this.storage, `documentacion/${userId}/`);
    const testArchivos = await listAll(testRef);
    console.log('Archivos directos en la carpeta del usuario:', testArchivos.items.map(a => a.name));
  }
}
