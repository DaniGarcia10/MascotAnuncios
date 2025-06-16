import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ArchivosService } from '../../services/archivos.service';
import { Firestore, doc, setDoc, collection, addDoc } from '@angular/fire/firestore';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentacionService } from '../../services/documentacion.service';
import { Estado } from '../../models/documentacion.model';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatSnackBarModule, RouterModule]
})
export class RegistroComponent {
  formRegistro: FormGroup;
  imagenUrl: string | null = null;
  isSubmitting: boolean = false;
  showPassword: boolean = false; 
  showRepetirPassword: boolean = false; 
  serverErrorFotoCriadero: string | null = null;
  serverErrorDni: string | null = null;
  serverErrorNz: string | null = null;
  serverError: string | null = null; // Añade esto si no existe

  constructor(
    private authService: AuthService,
    private firestore: Firestore,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private archivosService: ArchivosService,
    private documentacionService: DocumentacionService
  ) {
    this.formRegistro = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(80)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
      telefono: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.maxLength(15)]),
      vendedor: new FormControl(false),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
      repetirPassword: new FormControl('', [Validators.required]),
      fotoPerfil: new FormControl<File | null>(null, Validators.required),
      dniFile: new FormControl<File | null>(null),
      nzFile: new FormControl<File | null>(null),
      criadero: new FormGroup({
        nombre: new FormControl('', [Validators.maxLength(50)]),
        nucleo_zoologico: new FormControl('', [Validators.maxLength(14)]),
        ubicacion: new FormControl('', []),
        fotoPerfilCriadero: new FormControl<File | null>(null)
      })
    }, { validators: this.passwordsIgualesValidator });

    // Escucha cambios en el checkbox vendedor
    this.formRegistro.get('vendedor')?.valueChanges.subscribe((isVendedor: boolean) => {
      const criaderoGroup = this.formRegistro.get('criadero') as FormGroup;
      if (isVendedor) {
        criaderoGroup.get('nucleo_zoologico')?.setValidators([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9]+$'),
          Validators.minLength(12),
          Validators.maxLength(12)
        ]);
        criaderoGroup.get('ubicacion')?.setValidators([
          Validators.required,
          Validators.maxLength(100)
        ]);
        criaderoGroup.get('nombre')?.setValidators([
          Validators.required,
          Validators.maxLength(50)
        ]);
        criaderoGroup.get('fotoPerfilCriadero')?.setValidators([
          Validators.required
        ]);
      } else {
        criaderoGroup.get('nucleo_zoologico')?.clearValidators();
        criaderoGroup.get('ubicacion')?.clearValidators();
        criaderoGroup.get('nombre')?.clearValidators();
        criaderoGroup.get('fotoPerfilCriadero')?.clearValidators();
        criaderoGroup.reset();
      }
      criaderoGroup.get('nucleo_zoologico')?.updateValueAndValidity();
      criaderoGroup.get('ubicacion')?.updateValueAndValidity();
      criaderoGroup.get('nombre')?.updateValueAndValidity();
      criaderoGroup.get('fotoPerfilCriadero')?.updateValueAndValidity();
    });
  }

  // Validador personalizado para comprobar que las contraseñas coinciden
  passwordsIgualesValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const repetir = group.get('repetirPassword')?.value;
    return password === repetir ? null : { passwordsNoCoinciden: true };
  };

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    const control = this.formRegistro.get('fotoPerfil');
    if (file) {
      try {
        this.archivosService['validarExtension'](file);
        control?.setValue(file);
      } catch (error: any) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        const mensaje = `El formato "${extension}" no es válido. Formatos soportados: jpg, jpeg, png, webp, pdf.`;
        const modal = document.getElementById('modalErrorExtensionImagen');
        const mensajeElem = document.getElementById('mensajeErrorExtensionImagen');
        if (mensajeElem) mensajeElem.textContent = mensaje;
        if (modal && (window as any).bootstrap) {
          // @ts-ignore
          const bsModal = new (window as any).bootstrap.Modal(modal);
          bsModal.show();
        }
        event.target.value = '';
        control?.setValue(null);
      }
    } else {
      control?.setValue(null);
    }
    control?.markAsTouched();
  }

  onFileSelectedCriadero(event: any): void {
    const file = event.target.files[0];
    const control = this.formRegistro.get('criadero.fotoPerfilCriadero');
    if (file) {
      try {
        this.archivosService['validarExtension'](file);
        control?.setValue(file);
      } catch (error: any) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        const mensaje = `El formato "${extension}" no es válido. Formatos soportados: jpg, jpeg, png, webp, pdf.`;
        const modal = document.getElementById('modalErrorExtensionImagen');
        const mensajeElem = document.getElementById('mensajeErrorExtensionImagen');
        if (mensajeElem) mensajeElem.textContent = mensaje;
        if (modal && (window as any).bootstrap) {
          // @ts-ignore
          const bsModal = new (window as any).bootstrap.Modal(modal);
          bsModal.show();
        }
        event.target.value = '';
        control?.setValue(null);
      }
    } else {
      control?.setValue(null);
    }
    control?.markAsTouched();
  }

  onDniFileSelected(event: any): void {
    const file = event.target.files[0];
    const control = this.formRegistro.get('dniFile');
    if (file) {
      try {
        this.archivosService['validarExtensionDocumentos'](file);
        control?.setValue(file);
      } catch (error: any) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        const mensaje = `El formato "${extension}" no es válido. Formatos soportados: jpg, jpeg, png, webp, pdf.`;
        const modal = document.getElementById('modalErrorExtensionImagen');
        const mensajeElem = document.getElementById('mensajeErrorExtensionImagen');
        if (mensajeElem) mensajeElem.textContent = mensaje;
        if (modal && (window as any).bootstrap) {
          // @ts-ignore
          const bsModal = new (window as any).bootstrap.Modal(modal);
          bsModal.show();
        }
        event.target.value = '';
        control?.setValue(null);
      }
    } else {
      control?.setValue(null);
    }
    control?.markAsTouched();
  }

  onNzFileSelected(event: any): void {
    const file = event.target.files[0];
    const control = this.formRegistro.get('nzFile');
    if (file) {
      try {
        this.archivosService['validarExtensionDocumentos'](file);
        control?.setValue(file);
      } catch (error: any) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        const mensaje = `El formato "${extension}" no es válido. Formatos soportados: jpg, jpeg, png, webp, pdf.`;
        const modal = document.getElementById('modalErrorExtensionImagen');
        const mensajeElem = document.getElementById('mensajeErrorExtensionImagen');
        if (mensajeElem) mensajeElem.textContent = mensaje;
        if (modal && (window as any).bootstrap) {
          // @ts-ignore
          const bsModal = new (window as any).bootstrap.Modal(modal);
          bsModal.show();
        }
        event.target.value = '';
        control?.setValue(null);
      }
    } else {
      control?.setValue(null);
    }
    control?.markAsTouched();
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    // Limpiar errores previos
    this.serverErrorFotoCriadero = null;
    this.serverErrorDni = null;
    this.serverErrorNz = null;

    this.formRegistro.markAllAsTouched();

    if (this.isVendedor()) {
      const criaderoGroup = this.formRegistro.get('criadero') as FormGroup;
      criaderoGroup.markAllAsTouched();
    }

    this.cdr.markForCheck();

    // Validación de archivos obligatorios usando los FormControls
    const faltaFotoPerfil = !this.formRegistro.get('fotoPerfil')?.value;
    const faltaFotoCriadero = this.isVendedor() && !this.formRegistro.get('criadero.fotoPerfilCriadero')?.value;
    const faltaDni = this.isVendedor() && !this.formRegistro.get('dniFile')?.value;
    const faltaNz = this.isVendedor() && !this.formRegistro.get('nzFile')?.value;

    // Asignar errores de servidor si faltan archivos
    if (faltaFotoCriadero) this.serverErrorFotoCriadero = 'La foto de perfil del criadero es obligatoria.';
    if (faltaDni) this.serverErrorDni = 'El DNI/NIE es obligatorio.';
    if (faltaNz) this.serverErrorNz = 'El certificado del Núcleo Zoológico es obligatorio.';

    if (
      this.formRegistro.invalid ||
      faltaFotoPerfil ||
      faltaFotoCriadero ||
      faltaDni ||
      faltaNz
    ) {
      this.isSubmitting = false;
      this.cdr.markForCheck();
      return;
    }

    const usuario = this.formRegistro.value;

    // Cambia las referencias a los archivos:
    const fotoPerfil = this.formRegistro.get('fotoPerfil')?.value;
    const fotoPerfilCriadero = this.formRegistro.get('criadero.fotoPerfilCriadero')?.value;
    const dniFile = this.formRegistro.get('dniFile')?.value;
    const nzFile = this.formRegistro.get('nzFile')?.value;

    try {
      const response: any = await this.authService.registro(usuario.email, usuario.password);
      const userId = response.user?.uid;

      let nombreFotoPerfil = '';
      if (fotoPerfil) {
        const extension = fotoPerfil.name.split('.').pop()?.toLowerCase();
        nombreFotoPerfil = `${userId}.${extension}`;
        await this.archivosService.subirImagen(fotoPerfil, 'usuario', userId);
      }

      let idCriadero: string | null = null;

      if (this.isVendedor()) {
        const criaderoData = {
          nombre: usuario.criadero.nombre,
          nucleo_zoologico: usuario.criadero.nucleo_zoologico,
          ubicacion: usuario.criadero.ubicacion,
          foto_perfil: null,
          fecha_registro: new Date().toISOString()
        };

        // Guardar criadero sin documentación aún
        const criaderosRef = collection(this.firestore, 'criaderos');
        const docRef = await addDoc(criaderosRef, criaderoData);
        idCriadero = docRef.id;

        // Subir foto de perfil del criadero si existe
        if (fotoPerfilCriadero) {
          const extension = fotoPerfilCriadero.name.split('.').pop()?.toLowerCase();
          const nombreFotoCriadero = `${idCriadero}.${extension}`;
          await this.archivosService.subirImagen(fotoPerfilCriadero, 'criadero', idCriadero);

          await setDoc(doc(this.firestore, 'criaderos', idCriadero), {
            ...criaderoData,
            foto_perfil: nombreFotoCriadero
          });
        }
      }

      const usuarioDoc = {
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        vendedor: usuario.vendedor,
        id_criadero: idCriadero,
        foto_perfil: nombreFotoPerfil || null
      };

      await setDoc(doc(this.firestore, 'usuarios', userId), usuarioDoc);

      // Subir documentación adicional si existe
      if (dniFile) {
        await this.archivosService.subirDocumentacion(dniFile, 'dni', userId);
      }
      if (nzFile) {
        await this.archivosService.subirDocumentacion(nzFile, 'nz', userId);
      }

      //Registrar documentación automáticamente si es vendedor
      if (this.isVendedor()) {
        await this.documentacionService.guardarDocumentacion(userId, {
          estado: Estado.PENDIENTE,
          motivo: ""
        });
      }

      //Mostrar mensaje bonito y redirigir
      this.snackBar.open('¡Registro exitoso!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });

      this.router.navigate(['/anuncios']);

    } catch (error) {
      if ((error as any).code === 'auth/email-already-in-use') {
        this.snackBar.open('Este correo ya está registrado. Intenta con otro.', 'Cerrar', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      } else {
        console.error('Error en el registro:', error);
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  // Registro con Google
  registerWithGoogle(): void {
    this.authService.loginWithGoogle().then((result: any) => {
      const user = result.user;
      // Aquí podrías guardar datos adicionales si lo necesitas
      this.snackBar.open('¡Registro exitoso con Google!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });
      this.router.navigate(['/anuncios']);
    }).catch((error: any) => {
      const code = error?.code;
      this.serverError = 'Error al registrarse con Google: ' + (code || 'desconocido');
    });
  }

  // Registro con Facebook
  registerWithFacebook(): void {
    this.authService.loginWithFacebook().then((result: any) => {
      this.snackBar.open('¡Registro exitoso con Facebook!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });
      this.router.navigate(['/anuncios']);
    }).catch((error: any) => {
      const code = error?.code;
      this.serverError = 'Error al registrarse con Facebook: ' + (code || 'desconocido');
    });
  }

  isVendedor(): boolean {
    return this.formRegistro.get('vendedor')?.value;
  }
}
