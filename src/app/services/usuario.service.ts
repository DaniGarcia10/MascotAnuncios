import { Injectable, inject } from '@angular/core';
import { Database, ref, set } from '@angular/fire/database';
import { getDownloadURL, ref as storageRef, Storage } from '@angular/fire/storage'; // Importar Firebase Storage

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private COLLECTION_NAME = "usuarios";

  private database = inject(Database); // Usar inject para obtener la instancia de Database

  constructor(private storage: Storage) {} // Inyectar Storage

  // Ejemplo de método para guardar un usuario
  saveUser(userId: string, data: any): Promise<void> {
    const userRef = ref(this.database, `${this.COLLECTION_NAME}/${userId}`);
    return set(userRef, data);
  }

  async getFotoPerfil(fotoPerfilPath: string): Promise<string> {
    const imageRef = storageRef(this.storage, fotoPerfilPath);
    return getDownloadURL(imageRef);
  }
}
