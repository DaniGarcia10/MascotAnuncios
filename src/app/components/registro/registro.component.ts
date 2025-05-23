import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ArchivosService } from '../../services/archivos.service';
import { Firestore, doc, setDoc, collection, addDoc } from '@angular/fire/firestore';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatSnackBarModule]
})
export class RegistroComponent {
  formRegistro: FormGroup;
  imagenUrl: string | null = null;
  fotoPerfil: File | null = null;
  fotoPerfilCriadero: File | null = null;
  isSubmitting: boolean = false;
  dniFile: File | null = null;
  nzFile: File | null = null;

  constructor(
    private authService: AuthService,
    private firestore: Firestore,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private archivosService: ArchivosService
  ) {
    this.formRegistro = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      apellidos: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
      telefono: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.maxLength(15)]),
      vendedor: new FormControl(false),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
      repetirPassword: new FormControl('', [Validators.required]),
      criadero: new FormGroup({
        nombre: new FormControl('', [Validators.maxLength(50)]),
        nucleo_zoologico: new FormControl('', []), // Sin validadores por defecto
        ubicacion: new FormControl('', [])
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
      } else {
        criaderoGroup.get('nucleo_zoologico')?.clearValidators();
        criaderoGroup.get('ubicacion')?.clearValidators();
        criaderoGroup.get('nombre')?.clearValidators();
        criaderoGroup.reset();
      }
      criaderoGroup.get('nucleo_zoologico')?.updateValueAndValidity();
      criaderoGroup.get('ubicacion')?.updateValueAndValidity();
      criaderoGroup.get('nombre')?.updateValueAndValidity();
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
    if (file) {
      try {
        this.archivosService['validarExtension'](file);
        this.fotoPerfil = file;
        console.log('Foto de perfil seleccionada:', file.name);
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
        this.fotoPerfil = null;
      }
    }
  }

  onFileSelectedCriadero(event: any): void {
    const file = event.target.files[0];
    if (file) {
      try {
        this.archivosService['validarExtension'](file);
        this.fotoPerfilCriadero = file;
        console.log('Foto de perfil del criadero seleccionada:', file.name);
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
        this.fotoPerfilCriadero = null;
      }
    }
  }

  // Manejar selección de DNI/NIE
  onDniFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      try {
        this.archivosService['validarExtension'](file);
        this.dniFile = file;
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
        this.dniFile = null;
      }
    }
  }

  // Manejar selección de Núcleo Zoológico
  onNzFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      try {
        this.archivosService['validarExtension'](file);
        this.nzFile = file;
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
        this.nzFile = null;
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.formRegistro.markAllAsTouched();

    if (this.isVendedor()) {
      const criaderoGroup = this.formRegistro.get('criadero') as FormGroup;
      criaderoGroup.markAllAsTouched();
    }

    // Forzar detección de cambios para mostrar los small
    this.cdr.markForCheck();

    // Validación de archivos obligatorios
    const faltaFotoPerfil = !this.fotoPerfil;
    const faltaFotoCriadero = this.isVendedor() && !this.fotoPerfilCriadero;

    if (
      this.formRegistro.invalid ||
      faltaFotoPerfil ||
      faltaFotoCriadero
    ) {
      this.isSubmitting = false;
      this.cdr.markForCheck(); // Forzar actualización de la vista
      return;
    }

    const usuario = this.formRegistro.value;

    try {
      const response: any = await this.authService.registro(usuario.email, usuario.password);
      const userId = response.user?.uid;
      console.log('Registro exitoso:', userId);

      let nombreFotoPerfil = '';
      if (this.fotoPerfil) {
        const extension = this.fotoPerfil.name.split('.').pop()?.toLowerCase();
        nombreFotoPerfil = `${userId}.${extension}`;
        await this.archivosService.subirImagen(this.fotoPerfil, 'usuario', userId);
        console.log('Foto de perfil subida:', nombreFotoPerfil);
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
        if (this.fotoPerfilCriadero) {
          const extension = this.fotoPerfilCriadero.name.split('.').pop()?.toLowerCase();
          const nombreFotoCriadero = `${idCriadero}.${extension}`;
          await this.archivosService.subirImagen(this.fotoPerfilCriadero, 'criadero', idCriadero);

          await setDoc(doc(this.firestore, 'criaderos', idCriadero), {
            ...criaderoData,
            foto_perfil: nombreFotoCriadero
          });
        }
      }

      const usuarioDoc = {
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        telefono: usuario.telefono,
        vendedor: usuario.vendedor,
        id_criadero: idCriadero,
        foto_perfil: nombreFotoPerfil || null
      };

      await setDoc(doc(this.firestore, 'usuarios', userId), usuarioDoc);

      // Subir documentación adicional si existe
      if (this.dniFile) {
        await this.archivosService.subirDocumentacion(this.dniFile, 'dni', userId);
      }
      if (this.nzFile) {
        await this.archivosService.subirDocumentacion(this.nzFile, 'nz', userId);
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

  isVendedor(): boolean {
    return this.formRegistro.get('vendedor')?.value;
  }
}
