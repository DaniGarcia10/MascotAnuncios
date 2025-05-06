import { Injectable, NgZone } from '@angular/core';
import { Usuario } from '../models/Usuario.model'; 
import { Auth, User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage'; // Importar Firebase Storage
import { UsuarioService } from './usuario.service'; // Importar UsuarioService

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private logueado = new BehaviorSubject<boolean>(false); // Cambiar a BehaviorSubject

  constructor(private auth: Auth, private ngZone: NgZone, private firestore: Firestore, private usuarioService: UsuarioService) {
    onAuthStateChanged(this.auth, (user) => {
      this.ngZone.run(() => {
        this.logueado.next(!!user); // Actualizar el estado de autenticación dentro de NgZone
      });
    });
  }

  registro(email: string, password: string): any {
    return this.ngZone.run(() => {
      return createUserWithEmailAndPassword(this.auth, email, password);
    });
  }

  login(email: string, password: string): Promise<any> {
    return this.ngZone.run(() => {
      return signInWithEmailAndPassword(this.auth, email, password);
    });
  }

  logout(): Promise<void> {
    return this.ngZone.run(() => {
      return this.auth.signOut(); // Asegurar que signOut se ejecuta dentro de NgZone
    });
  }

  isAuthenticated(): BehaviorSubject<boolean> {
    return this.logueado; // Retornar el BehaviorSubject
  }

  getUserDataAuth(): Observable<{ user: User | null, usuario: Usuario | null }> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          console.log('Usuario autenticado:', user);
          try {
            const userDocRef = doc(this.firestore, 'usuarios', user.uid); // Ruta de la colección 'usuarios'
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const usuarioData = userDocSnap.data() as Usuario;

              console.log('Datos del usuario obtenidos de Firestore:', usuarioData);
              observer.next({ user, usuario: usuarioData });
            } else {
              observer.next({ user, usuario: null }); // Usuario no encontrado en Firestore
            }
          } catch (error) {
            console.error('Error al obtener los datos del usuario:', error);
            observer.error(error);
          }
        } else {
          observer.next({ user: null, usuario: null }); // Usuario no autenticado
        }
      });
    });
  }

  getUsuarioId(): string | null {
    const user = this.auth.currentUser;
    return user ? user.uid : null; // Retorna el UID del usuario autenticado o null si no está autenticado
  }

}
