import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
})
export class LoginComponent {
  formLogin: FormGroup;
  imagenUrl: string | null = null; 
  serverError: string | null = null; 
  showPassword: boolean = false; 
  resetPasswordMessage: string | null = null;
  showResetModal: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router 
  ) {
    this.formLogin = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  private firebaseErrorMessages: { [key: string]: string } = {
    'auth/invalid-email': 'El email no tiene un formato válido.',
    'auth/user-not-found': 'El usuario no existe.',
    'auth/wrong-password': 'La contraseña es incorrecta.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
    'auth/network-request-failed': 'Error de red. Verifica tu conexión.',
    'auth/internal-error': 'Error interno del servidor. Intenta más tarde.',
    'auth/invalid-credential': 'La credencial es inválida o la contraseña es incorrecta.',
  };

  private getFirebaseErrorMessage(code: string): string {
    return this.firebaseErrorMessages[code] || 'Error desconocido en el login';
  }

  onSubmit(): void {
    this.serverError = null;
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }
    const { email, password } = this.formLogin.value;
    this.authService.login(email, password).then((response: any) => {
      this.router.navigate(['/anuncios']);
    }).catch((error: any) => {
      // Traducir el error de Firebase si existe
      const code = error?.code;
      this.serverError = this.getFirebaseErrorMessage(code);
    });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle().then((result: any) => {
      const user = result.user;
      console.log('UID:', user.uid);
      console.log('Nombre:', user.displayName);
      console.log('Email:', user.email);
      console.log('Foto:', user.photoURL);
      this.router.navigate(['/anuncios']);
    }).catch((error: any) => {
      const code = error?.code;
      this.serverError = this.getFirebaseErrorMessage(code);
    });
  }

  loginWithFacebook(): void {
    this.authService.loginWithFacebook().then(() => {
      this.router.navigate(['/anuncios']);
    }).catch((error: any) => {
      const code = error?.code;
      this.serverError = this.getFirebaseErrorMessage(code);
    });
  }

  resetPassword(): void {
    this.resetPasswordMessage = null;
    this.serverError = null;
    const email = this.formLogin.get('email')?.value;
    if (!email) {
      this.serverError = 'Por favor, introduce tu correo electrónico para restablecer la contraseña.';
      return;
    }
    this.authService.resetPassword(email)
      .then(() => {
        this.resetPasswordMessage = 'Se ha enviado un correo para restablecer tu contraseña.';
      })
      .catch((error: any) => {
        const code = error?.code;
        this.serverError = this.getFirebaseErrorMessage(code);
      });
  }

  openResetModal(): void {
    this.serverError = null;
    this.resetPasswordMessage = null;
    this.showResetModal = true;
  }

  closeResetModal(): void {
    this.showResetModal = false;
  }

  confirmResetPassword(): void {
    this.showResetModal = false;
    this.resetPassword();
  }
}
