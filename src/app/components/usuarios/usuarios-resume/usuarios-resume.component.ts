import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/Usuario.model';
import { auth } from '../../../firebase-config';
import { sendPasswordResetEmail } from 'firebase/auth';

@Component({
  selector: 'app-usuarios-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-resume.component.html',
  styleUrl: './usuarios-resume.component.css'
})
export class UsuariosResumeComponent {
  @Input() usuarios: Usuario[] = [];
  usuarioExpandido: Usuario | null = null;

  toggleUsuario(usuario: Usuario) {
    this.usuarioExpandido = this.usuarioExpandido === usuario ? null : usuario;
  }

  async restablecerContrasena(usuario: Usuario) {
    try {
      await sendPasswordResetEmail(auth, usuario.email);
      console.log('Correo de restablecimiento enviado');
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
    }
  }

}
