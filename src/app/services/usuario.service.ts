import { Injectable, inject } from '@angular/core';
import { Database, ref, set } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private COLLECTION_NAME = "usuarios";

  private database = inject(Database); // Usar inject para obtener la instancia de Database

  constructor() {}

  // Ejemplo de método para guardar un usuario
  saveUser(userId: string, data: any): Promise<void> {
    const userRef = ref(this.database, `${this.COLLECTION_NAME}/${userId}`);
    return set(userRef, data);
  }
}
