import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn: boolean = false; // Estado de autenticación

  constructor() {}

  login(email: string, password: string): Observable<any> {
    console.log('Autenticando usuario:', email);
    this.isLoggedIn = true; // Simulación de inicio de sesión exitoso
    return of({ success: true });
  }

  register(email: string, password: string): Observable<any> {
    console.log('Registrando usuario:', email);
    return of({ success: true });
  }

  logout(): void {
    this.isLoggedIn = false; // Cerrar sesión
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn; // Verificar si está autenticado
  }
}
