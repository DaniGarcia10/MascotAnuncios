import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Usuario } from '../../models/Usuario.model';
import { Criadero } from '../../models/Criadero.model';
import { UsuarioService } from '../../services/usuario.service';
import { CriaderoService } from '../../services/criadero.service';
import { ArchivosService } from '../../services/archivos.service';
import { DocumentacionService } from '../../services/documentacion.service';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateEmail, sendEmailVerification } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

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
  documentacion: any = null;

  showPasswordActual: boolean = false;
  showNuevaPassword: boolean = false;
  showConfirmarPassword: boolean = false;
  mensajeErrorPassword: string = '';

  serverError: string = '';

  @ViewChild('modalExitoPassword') modalExitoPassword!: ElementRef;

  constructor(
    private auth: Auth,
    private usuarioService: UsuarioService,
    private criaderoService: CriaderoService,
    private archivosService: ArchivosService,
    private documentacionService: DocumentacionService
  ) {
    this.perfilForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      email: new FormControl({ value: '', disabled: true }, [Validators.email]),
      telefono: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.maxLength(15)]),
    });

    this.passwordForm = new FormGroup({
      passwordActual: new FormControl('', [Validators.required]),
      nuevaPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
      ]),
      confirmarPassword: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.usuarioService.getUsuarioById(user.uid).then(async (usuario) => {
          this.usuario = usuario;
          if (this.usuario) {
            this.perfilForm.patchValue(this.usuario);
            if (this.usuario.foto_perfil) {
              if (this.usuario.foto_perfil.startsWith('http')) {
                // Es una URL externa (Google, Facebook, etc.)
                this.imagenUrlPerfil = this.usuario.foto_perfil;
              } else {
                // Es un archivo en Firebase Storage
                const ruta = `usuarios/${this.usuario.foto_perfil}`;
                this.imagenUrlPerfil = await this.archivosService.obtenerUrlImagen(ruta);
              }
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
    });
  }

  async cargarCriadero(id: string): Promise<void> {
    try {
      const criadero = await this.criaderoService.getCriaderoById(id);
      this.criadero = criadero || null;

      if (this.criadero?.foto_perfil) {
        const ruta = `criaderos/${this.criadero.foto_perfil}`;
        this.imagenUrlCriadero = await this.archivosService.obtenerUrlImagen(ruta);
      }

      // Cargar documentación asociada al criadero
      if (this.usuario?.id) {
        this.documentacion = await this.documentacionService.obtenerDocumentacion(this.usuario.id);
      } else {
        this.documentacion = null;
      }
    } catch (err) {
      console.error('Error al obtener los datos del criadero:', err);
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  cancelEdit(): void {
    this.editMode = false;
    this.perfilForm.reset(this.usuario);
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  cambiarPassword(): void {
    // Marcar todos los campos como tocados
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.valid) {
      const { passwordActual, nuevaPassword, confirmarPassword } = this.passwordForm.value;

      if (nuevaPassword !== confirmarPassword) {
        this.mensajeErrorPassword = 'Las contraseñas no coinciden.';
        const modal = new (window as any).bootstrap.Modal(document.getElementById('modalErrorPassword'));
        modal.show();
        return;
      }

      const auth = getAuth();
      const usuario = auth.currentUser;

      if (!usuario || !usuario.email) {
        this.mensajeErrorPassword = 'Usuario no autenticado.';
        const modal = new (window as any).bootstrap.Modal(document.getElementById('modalErrorPassword'));
        modal.show();
        return;
      }

      const credential = EmailAuthProvider.credential(usuario.email, passwordActual);

      reauthenticateWithCredential(usuario, credential)
        .then(() => {
          return updatePassword(usuario, nuevaPassword);
        })
        .then(() => {
          // Mostrar el modal de éxito
          this.passwordForm.reset();
          // Bootstrap 5: mostrar modal por id
          const modal = new (window as any).bootstrap.Modal(document.getElementById('modalExitoPassword'));
          modal.show();
        })
        .catch(error => {
          console.error(error);
          // Ahora también detecta 'auth/invalid-credential' como contraseña incorrecta
          if (
            error.code === 'auth/wrong-password' ||
            error.code === 'auth/user-mismatch' ||
            error.code === 'auth/invalid-credential' ||
            error.message?.includes('wrong-password')
          ) {
            this.mensajeErrorPassword = 'La contraseña actual es incorrecta.';
          } else {
            this.mensajeErrorPassword = 'Error al cambiar la contraseña.';
          }
          // Mostrar el modal de error
          const modal = new (window as any).bootstrap.Modal(document.getElementById('modalErrorPassword'));
          modal.show();
        });
    }
  }

  guardarPerfil() {
    this.serverError = ''; // Limpiar error anterior
    if (this.perfilForm.valid && this.usuario) {
      const datosActualizados = this.perfilForm.value;
      delete datosActualizados.email;

      this.usuarioService.actualizarUsuario(this.usuario.id, datosActualizados)
        .then(() => {
          this.usuario = { ...this.usuario!, ...datosActualizados };
          this.editMode = false;
        })
        .catch(error => {
          this.serverError = 'Error al actualizar el perfil. Intenta de nuevo más tarde.';
        });
    }
  }
}
