import { Injectable, inject } from '@angular/core';
import { Database, ref, set } from '@angular/fire/database';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Usuario } from '../models/Usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private COLLECTION_NAME = "usuarios";
  private database = inject(Database);

  constructor(private firestore: Firestore) {}

  // Guarda usuario en Realtime Database (si lo usas)
  saveUser(userId: string, data: any): Promise<void> {
    const userRef = ref(this.database, `${this.COLLECTION_NAME}/${userId}`);
    return set(userRef, data);
  }

  // Obtener datos del usuario desde Firestore
  async getUsuarioById(userId: string): Promise<Usuario | null> {
    try {
      const userDocRef = doc(this.firestore, this.COLLECTION_NAME, userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const usuarioData = userDocSnap.data() as Usuario;
        console.log('Datos del usuario obtenidos de Firestore:', usuarioData);
        return usuarioData;
      } else {
        console.warn('Usuario no encontrado en Firestore');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      throw error;
    }
  }

  // Obtener ID del criadero de un usuario
  async getIdCriaderoByUsuarioId(userId: string): Promise<string | null> {
    try {
      const userDocRef = doc(this.firestore, this.COLLECTION_NAME, userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const usuarioData = userDocSnap.data() as Usuario;
        return usuarioData.id_criadero || null;
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
