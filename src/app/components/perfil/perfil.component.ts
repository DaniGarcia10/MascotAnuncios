import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Usuario } from '../../models/Usuario.model';
import { Criadero } from '../../models/Criadero.model';
import { UsuarioService } from '../../services/usuario.service';
import { CriaderoService } from '../../services/criadero.service';
import { ImagenService } from '../../services/imagen.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: Usuario | null = null;
  criadero: Criadero | null = null;
  imagenUrlPerfil: string | null = null;
  imagenUrlCriadero: string | null = null;

  editMode: boolean = false;
  perfilForm: FormGroup;
  passwordForm: FormGroup;
  activeSection: string = 'general';

  constructor(
    private auth: Auth,
    private usuarioService: UsuarioService,
    private criaderoService: CriaderoService,
    private imagenService: ImagenService
  ) {
    this.perfilForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      apellidos: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
      telefono: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.maxLength(15)]),
    });

    this.passwordForm = new FormGroup({
      passwordActual: new FormControl('', [Validators.required]),
      nuevaPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmarPassword: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user) {
      this.usuarioService.getUsuarioById(user.uid).then(async (usuario) => {
        this.usuario = usuario;

        if (this.usuario) {
          this.perfilForm.patchValue(this.usuario);

          if (this.usuario.foto_perfil) {
            const ruta = `usuarios/${this.usuario.foto_perfil}`;
            this.imagenUrlPerfil = await this.imagenService.obtenerUrlImagen(ruta);
          }

          if (this.usuario.id_criadero) {
            await this.cargarCriadero(this.usuario.id_criadero);
          }
        }
      }).catch((err) => {
        console.error('Error al obtener los datos del usuario:', err);
      });
    } else {
      console.log('No hay usuario autenticado');
    }
  }

  async cargarCriadero(id: string): Promise<void> {
    try {
      const criadero = await this.criaderoService.getCriaderoById(id);
      this.criadero = criadero || null;

      if (this.criadero?.foto_perfil) {
        const ruta = `criaderos/${this.criadero.foto_perfil}`;
        this.imagenUrlCriadero = await this.imagenService.obtenerUrlImagen(ruta);
      }
    } catch (err) {
      console.error('Error al obtener los datos del criadero:', err);
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode && this.perfilForm.valid) {
      console.log('Datos guardados:', this.perfilForm.value);
      // Aquí puedes llamar a un método para guardar los cambios si quieres
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.perfilForm.reset(this.usuario);
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  cambiarPassword(): void {
    if (this.passwordForm.valid) {
      const { passwordActual, nuevaPassword, confirmarPassword } = this.passwordForm.value;
      if (nuevaPassword !== confirmarPassword) {
        alert('Las contraseñas no coinciden.');
        return;
      }
      // Aquí va la lógica real para cambiar la contraseña
      console.log('Contraseña cambiada:', nuevaPassword);
    }
  }
}
