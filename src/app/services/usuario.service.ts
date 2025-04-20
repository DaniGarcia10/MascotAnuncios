import { Injectable, inject } from '@angular/core';
import { Database, ref, set } from '@angular/fire/database';
import { getDownloadURL, ref as storageRef, Storage } from '@angular/fire/storage'; // Importar Firebase Storage
import { Firestore, doc, getDoc } from '@angular/fire/firestore'; // Importar Firestore
import { Usuario } from '../models/Usuario.model'; // Importar modelo Usuario

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private COLLECTION_NAME = "usuarios";

  private database = inject(Database); // Usar inject para obtener la instancia de Database

  constructor(private storage: Storage, private firestore: Firestore) {} // Inyectar Firestore

  // Ejemplo de método para guardar un usuario
  saveUser(userId: string, data: any): Promise<void> {
    const userRef = ref(this.database, `${this.COLLECTION_NAME}/${userId}`);
    return set(userRef, data);
  }

  async getFotoPerfil(fotoPerfilPath: string): Promise<string> {
    const imageRef = storageRef(this.storage, fotoPerfilPath);
    return getDownloadURL(imageRef);
  }

  async getUsuarioById(userId: string): Promise<Usuario | null> {
    try {
      const userDocRef = doc(this.firestore, this.COLLECTION_NAME, userId); // Ruta de la colección 'usuarios'
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const usuarioData = userDocSnap.data() as Usuario;

        if (usuarioData.foto_perfil) {
          usuarioData.foto_perfil = await this.getFotoPerfil(usuarioData.foto_perfil);
        }

        console.log('Datos del usuario obtenidos de Firestore:', usuarioData);
        return usuarioData;
      } else {
        console.warn('Usuario no encontrado en Firestoreeeeeeeee');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      throw error;
    }
  }

  async getIdCriaderoByUsuarioId(userId: string): Promise<string | null> {
    try {
      const userDocRef = doc(this.firestore, this.COLLECTION_NAME, userId); // Ruta de la colección 'usuarios'
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const usuarioData = userDocSnap.data() as Usuario;
        return usuarioData.id_criadero || null; // Retorna el id_criadero o null si no existe
      } else {
        console.warn('Usuario no encontrado');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el id del criadero:', error);
      throw error;
    }
  }
}
