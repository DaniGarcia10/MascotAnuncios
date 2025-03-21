import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Usuario } from '../models/Usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private logueado: boolean = false;

  constructor(private auth:Auth) { }

  registro(email:string, password:string): any {
      return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout(): Promise<void> {
    return this.auth.signOut();
  }

  isAuthenticated(): boolean {
    return this.logueado; // Verificar si está autenticado
  }

  getUserAuthenticated(): Observable<Usuario | null> {
    return new Observable((observer) => {
      onAuthStateChanged(
        this.auth,
        (usuario: User | null) => {
          if (usuario) {
            const usuarioTransformado: Usuario = new Usuario(
              usuario.uid,
              usuario.displayName || '', // Nombre
              '', // Apellidos (Firebase no proporciona esta propiedad)
              usuario.email || '',
              '', // Teléfono (Firebase no proporciona esta propiedad)
              false, // Vendedor (valor predeterminado)
              '', // ID criadero (valor predeterminado)
              usuario.photoURL || '' // Foto de perfil
            );
            observer.next(usuarioTransformado);
          } else {
            observer.next(null);
          }
        },
        (error: Error) => {
          observer.error(error);
        }
      );
    });
  }

}
