import { Injectable, NgZone } from '@angular/core';
import { Usuario } from '../models/Usuario.model'; 
import { Auth, User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, sendEmailVerification } from '@angular/fire/auth'; // <-- Agrega sendEmailVerification
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { UsuarioService } from './usuario.service'; // Importar UsuarioService

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private logueado = new BehaviorSubject<boolean | null>(null);

  constructor(private auth: Auth, private ngZone: NgZone, private firestore: Firestore, private usuarioService: UsuarioService) {
    onAuthStateChanged(this.auth, (user) => {
      this.ngZone.run(() => {
        this.logueado.next(!!user); // Actualizar el estado de autenticación dentro de NgZone
      });
    });
  }

  registro(email: string, password: string): any {
    return this.ngZone.run(() => {
      return createUserWithEmailAndPassword(this.auth, email, password)
        .then((userCredential) => {
          // Enviar correo de verificación
          sendEmailVerification(userCredential.user).then(() => {
            console.log('Correo de verificación enviado');
          });
          return userCredential;
        });
    });
  }

  login(email: string, password: string): Promise<any> {
    return this.ngZone.run(() => {
      return signInWithEmailAndPassword(this.auth, email, password);
    });
  }

  // Método para login con Google
  loginWithGoogle(): Promise<any> {
    const provider = new GoogleAuthProvider();
    return this.ngZone.run(async () => {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      // Verificar si el usuario ya existe en Firestore
      const userDocRef = doc(this.firestore, 'usuarios', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Solo crea el documento si no existe
        await setDoc(
          userDocRef,
          {
            nombre: user.displayName || '',
            email: user.email || '',
            foto_perfil: user.photoURL || '',
            telefono: '',
            vendedor: false,
            id_criadero: null
          }
        );
      }
      // Si ya existe, no sobrescribas nada
      return result;
    });
  }

  // Método para login con Facebook
  loginWithFacebook(): Promise<any> {
    const provider = new FacebookAuthProvider();
    return this.ngZone.run(() => {
      return signInWithPopup(this.auth, provider);
    });
  }

  logout(): Promise<void> {
    return this.ngZone.run(() => {
      return this.auth.signOut(); // Asegurar que signOut se ejecuta dentro de NgZone
    });
  }

  isAuthenticated(): Observable<boolean | null> {
    return this.logueado.asObservable();
  }

  isLoggedIn(): boolean {
    return !!this.logueado.value;
  }

  getUserDataAuth(): Observable<{ user: User | null, usuario: Usuario | null }> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          if (user.emailVerified) {
            // El correo está verificado
            console.log('El correo está verificado');
          } else {
            // El correo NO está verificado
            console.log('El correo NO está verificado');
          }
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
