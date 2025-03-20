import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true, // Asegurarse de que sea standalone
  imports: [FormsModule], // Agregar FormsModule aquí
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthService) {}

  register() {
    if (this.password !== this.confirmPassword) {
      console.error('Las contraseñas no coinciden');
      return;
    }
    this.authService.register(this.email, this.password).subscribe({
      next: (response) => console.log('Registro exitoso:', response),
      error: (err) => console.error('Error en registro:', err),
    });
  }
}
