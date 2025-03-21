import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Usuario } from '../models/Usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private logueado: boolean = false;

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => {
      this.logueado = !!user;
    });
  }

  registro(email: string, password: string): any {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout(): Promise<void> {
    return this.auth.signOut();
  }

  isAuthenticated(): boolean {
    return this.logueado;
  }

}
