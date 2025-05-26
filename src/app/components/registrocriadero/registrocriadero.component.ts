import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ArchivosService } from '../../services/archivos.service';
import { Firestore, doc, setDoc, collection, addDoc } from '@angular/fire/firestore';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentacionService } from '../../services/documentacion.service';
import { Estado } from '../../models/documentacion.model';

@Component({
  selector: 'app-registrocriadero',
  templateUrl: './registrocriadero.component.html',
  styleUrls: ['./registrocriadero.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatSnackBarModule]
})
export class RegistrocriaderoComponent{
  formRegistro: FormGroup;
  isSubmitting: boolean = false;
  showPassword: boolean = false;
  showRepetirPassword: boolean = false;
  serverErrorFotoCriadero: string | null = null;
  serverErrorDni: string | null = null;
  serverErrorNz: string | null = null;

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
      telefono: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.maxLength(15)]),
      vendedor: new FormControl(true), 
      dniFile: new FormControl<File | null>(null),
      nzFile: new FormControl<File | null>(null),
      criadero: new FormGroup({
        nombre: new FormControl('', [Validators.required, Validators.maxLength(50)]),
        nucleo_zoologico: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9]+$'),
          Validators.minLength(12),
          Validators.maxLength(12)
        ]),
        ubicacion: new FormControl('', [Validators.required, Validators.maxLength(100)]),
        fotoPerfilCriadero: new FormControl<File | null>(null, Validators.required)
      })
    });
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

    const criaderoGroup = this.formRegistro.get('criadero') as FormGroup;
    criaderoGroup.markAllAsTouched();

    this.cdr.markForCheck();

    // Validación de archivos obligatorios usando los FormControls
    const faltaFotoCriadero = !this.formRegistro.get('criadero.fotoPerfilCriadero')?.value;
    const faltaDni = !this.formRegistro.get('dniFile')?.value;
    const faltaNz = !this.formRegistro.get('nzFile')?.value;

    // Asignar errores de servidor si faltan archivos
    if (faltaFotoCriadero) this.serverErrorFotoCriadero = 'La foto de perfil del criadero es obligatoria.';
    if (faltaDni) this.serverErrorDni = 'El DNI/NIE es obligatorio.';
    if (faltaNz) this.serverErrorNz = 'El certificado del Núcleo Zoológico es obligatorio.';

    if (
      this.formRegistro.invalid ||
      faltaFotoCriadero ||
      faltaDni ||
      faltaNz
    ) {
      this.isSubmitting = false;
      this.cdr.markForCheck();
      return;
    }

    // Los campos nombre y email ya no existen, elimina la asignación manual
    const usuario = {
      ...this.formRegistro.getRawValue()
    };

    const fotoPerfilCriadero = this.formRegistro.get('criadero.fotoPerfilCriadero')?.value;
    const dniFile = this.formRegistro.get('dniFile')?.value;
    const nzFile = this.formRegistro.get('nzFile')?.value;

    try {
      // El registro de usuario ya existe, aquí solo se registra el criadero y la documentación
      let idCriadero: string | null = null;

      // Guardar criadero sin documentación aún
      const criaderoData = {
        nombre: usuario.criadero.nombre,
        nucleo_zoologico: usuario.criadero.nucleo_zoologico,
        ubicacion: usuario.criadero.ubicacion,
        foto_perfil: null,
        fecha_registro: new Date().toISOString()
      };

      const criaderosRef = collection(this.firestore, 'criaderos');
      const docRef = await addDoc(criaderosRef, criaderoData);
      idCriadero = docRef.id;

      // Subir foto de perfil del criadero si existe
      if (fotoPerfilCriadero) {
        const extension = fotoPerfilCriadero.name.split('.').pop()?.toLowerCase();
        const nombreFotoCriadero = `${idCriadero}.${extension}`;
        await this.archivosService.subirImagen(fotoPerfilCriadero, 'criadero', idCriadero);
      }

      // Actualizar usuario con id_criadero (deberías tener el userId del usuario logueado)
      const userId = this.authService.getUsuarioId();
      if (!userId) {
        throw new Error('No se pudo obtener el usuario autenticado.');
      }
      const usuarioDoc = {
        telefono: usuario.telefono,
        vendedor: true,
        id_criadero: idCriadero
      };

      await setDoc(doc(this.firestore, 'usuarios', userId), usuarioDoc, { merge: true });

      // Subir documentación adicional si existe
      if (dniFile) {
        await this.archivosService.subirDocumentacion(dniFile, 'dni', userId);
      }
      if (nzFile) {
        await this.archivosService.subirDocumentacion(nzFile, 'nz', userId);
      }

      //Registrar documentación automáticamente
      await this.documentacionService.guardarDocumentacion(userId, {
        estado: Estado.PENDIENTE,
        motivo: ""
      });

      //Mostrar mensaje bonito y redirigir
      this.snackBar.open('¡Registro de criadero exitoso!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });

      this.router.navigate(['/anuncios']);

    } catch (error) {
      this.snackBar.open('Error en el registro de criadero.', 'Cerrar', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      console.error('Error en el registro de criadero:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  isVendedor(): boolean {
    return true;
  }
}
