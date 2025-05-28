import { Injectable, inject } from '@angular/core';
import { Database, ref, set } from '@angular/fire/database';
import { Firestore, doc, getDoc, setDoc, collection, getDocs } from '@angular/fire/firestore';
import { Usuario } from '../models/Usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private COLLECTION_NAME = "usuarios";
  private database = inject(Database);

  constructor(private firestore: Firestore) {}

  // Obtener datos del usuario desde Firestore
  async getUsuarioById(userId: string): Promise<Usuario | null> {
    try {
      const userDocRef = doc(this.firestore, this.COLLECTION_NAME, userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const usuarioData = userDocSnap.data() as Usuario;
        return { ...usuarioData, id: userId }; 
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      throw error;
    }
  }

  // Obtener ID del criadero de un usuario
  getIdCriaderoByUsuarioId(userId: string): Promise<string | null> {
    return this.getUsuarioById(userId).then(usuario => {
      return usuario?.id_criadero || null;
    }).catch(error => {
      console.error('Error al obtener el criadero del usuario:', error);
      return null;
    });
  }

  getIdSuscripcionByUsuarioId(userId: string): Promise<string | null> {
    return this.getUsuarioById(userId).then(usuario => {
      return usuario?.suscripcion || null;
    }).catch(error => {
      console.error('Error al obtener la suscripción del usuario:', error);
      return null;
    });
  }

  // Actualizar datos del usuario en Firestore
  async actualizarUsuario(userId: string, data: Partial<Usuario>): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, this.COLLECTION_NAME, userId);
      await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      throw error;
    }
  }

  async getAllUsuarios(): Promise<Usuario[]> {
    const usuarios: Usuario[] = [];
    const usuariosCollection = collection(this.firestore, this.COLLECTION_NAME);
    const snapshot = await getDocs(usuariosCollection);
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as Usuario;
      usuarios.push({ ...data, id: docSnap.id });
    });
    return usuarios;
  }

}
