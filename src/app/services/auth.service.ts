import { Injectable, NgZone } from '@angular/core';
import { Usuario } from '../models/Usuario.model'; 
import { Auth, User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage'; // Importar Firebase Storage

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private logueado = new BehaviorSubject<boolean>(false); // Cambiar a BehaviorSubject

  constructor(private auth: Auth, private ngZone: NgZone, private firestore: Firestore, private storage: Storage) {
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

              // Obtener la URL de la imagen desde Firebase Storage
              const imageDocRef = doc(this.firestore, 'imagenes', usuarioData.foto_perfil);
              const imageDocSnap = await getDoc(imageDocRef);
              const imageData = imageDocSnap.data();
              const url = imageData ? imageData["url"] : null;
              console.log('Datos de la imagen obtenidos de Firestore:', imageDocSnap.data());
              if (usuarioData.foto_perfil) {
                const imageRef = ref(this.storage, url);
                usuarioData.foto_perfil = await getDownloadURL(imageRef);
              }

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

}
