import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ImagenService } from '../../services/imagen.service';
import { Firestore, doc, setDoc, collection, addDoc } from '@angular/fire/firestore';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatSnackBarModule]
})
export class RegistroComponent implements OnInit {
  formRegistro: FormGroup;
  imagenUrl: string | null = null;
  fotoPerfil: File | null = null;
  fotoPerfilCriadero: File | null = null;
  isSubmitting: boolean = false;
  documentacionFiles: File[] = [];

  constructor(
    private authService: AuthService,
    private imagenService: ImagenService,
    private firestore: Firestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.formRegistro = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      apellidos: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
      telefono: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.maxLength(15)]),
      vendedor: new FormControl(false),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
      criadero: new FormGroup({
        nombre: new FormControl('', [Validators.maxLength(50)]),
        nucleo_zoologico: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9]+$'),
          Validators.minLength(12),
          Validators.maxLength(12)
        ]),
        ubicacion: new FormControl('', [Validators.required, Validators.maxLength(100)])
      })
    });
  }

  ngOnInit(): void {
    this.imagenService.cargarImagenes(['registro2.jpg'])
      .then((urls) => this.imagenUrl = urls[0])
      .catch((error) => console.error('Error al cargar la imagen:', error));
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fotoPerfil = file;
      console.log('Foto de perfil seleccionada:', file.name);
    }
  }

  onFileSelectedCriadero(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fotoPerfilCriadero = file;
      console.log('Foto de perfil del criadero seleccionada:', file.name);
    }
  }

  // Manejar selección de archivos de documentación
  onDocumentacionFilesSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.documentacionFiles = Array.from(event.target.files);
      console.log('Archivos de documentación seleccionados:', this.documentacionFiles.map(f => f.name));
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const usuario = this.formRegistro.value;
    let errores: string[] = [];

    // Validaciones adicionales para criadero
    if (this.isVendedor()) {
      const criaderoGroup = this.formRegistro.get('criadero') as FormGroup;
      // Nombre obligatorio
      if (criaderoGroup.get('nombre')?.invalid) {
        errores.push('El nombre del criadero es obligatorio.');
        criaderoGroup.get('nombre')?.markAsTouched();
      }
      // Foto de perfil obligatoria
      if (!this.fotoPerfilCriadero) {
        errores.push('La foto de perfil del criadero es obligatoria.');
      }
      // Validaciones de campos internos
      if (criaderoGroup.get('nucleo_zoologico')?.invalid) {
        if (criaderoGroup.get('nucleo_zoologico')?.errors?.['required']) {
          errores.push('El núcleo zoológico es obligatorio.');
        }
        if (criaderoGroup.get('nucleo_zoologico')?.errors?.['pattern']) {
          errores.push('El núcleo zoológico solo permite caracteres alfanuméricos.');
        }
        if (criaderoGroup.get('nucleo_zoologico')?.errors?.['minlength'] || criaderoGroup.get('nucleo_zoologico')?.errors?.['maxlength']) {
          errores.push('El núcleo zoológico debe tener exactamente 12 caracteres.');
        }
      }
      if (criaderoGroup.get('ubicacion')?.invalid) {
        if (criaderoGroup.get('ubicacion')?.errors?.['required']) {
          errores.push('La ubicación del criadero es obligatoria.');
        }
        if (criaderoGroup.get('ubicacion')?.errors?.['maxlength']) {
          errores.push('La ubicación del criadero excede el máximo de caracteres.');
        }
      }
    }

    // Validaciones generales del formulario
    if (this.formRegistro.get('nombre')?.invalid) {
      errores.push('El nombre es obligatorio.');
      this.formRegistro.get('nombre')?.markAsTouched();
    }
    if (this.formRegistro.get('apellidos')?.invalid) {
      errores.push('Los apellidos son obligatorios.');
      this.formRegistro.get('apellidos')?.markAsTouched();
    }
    if (this.formRegistro.get('email')?.invalid) {
      if (this.formRegistro.get('email')?.errors?.['required']) {
        errores.push('El correo es obligatorio.');
      }
      if (this.formRegistro.get('email')?.errors?.['email']) {
        errores.push('El formato del correo no es válido.');
      }
      if (this.formRegistro.get('email')?.errors?.['maxlength']) {
        errores.push('El correo excede el máximo de caracteres.');
      }
      this.formRegistro.get('email')?.markAsTouched();
    }
    if (this.formRegistro.get('telefono')?.invalid) {
      if (this.formRegistro.get('telefono')?.errors?.['required']) {
        errores.push('El teléfono es obligatorio.');
      }
      if (this.formRegistro.get('telefono')?.errors?.['pattern']) {
        errores.push('El teléfono solo permite números.');
      }
      if (this.formRegistro.get('telefono')?.errors?.['maxlength']) {
        errores.push('El teléfono excede el máximo de caracteres.');
      }
      this.formRegistro.get('telefono')?.markAsTouched();
    }
    if (this.formRegistro.get('password')?.invalid) {
      if (this.formRegistro.get('password')?.errors?.['required']) {
        errores.push('La contraseña es obligatoria.');
      }
      if (this.formRegistro.get('password')?.errors?.['minlength']) {
        errores.push('La contraseña debe tener al menos 6 caracteres.');
      }
      if (this.formRegistro.get('password')?.errors?.['maxlength']) {
        errores.push('La contraseña excede el máximo de caracteres.');
      }
      this.formRegistro.get('password')?.markAsTouched();
    }

    if (errores.length > 0) {
      this.snackBar.open(errores.join(' '), 'Cerrar', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error'],
        duration: 6000
      });
      this.isSubmitting = false;
      return;
    }

    try {
      const response: any = await this.authService.registro(usuario.email, usuario.password);
      const userId = response.user?.uid;
      console.log('Registro exitoso:', userId);

      let nombreFotoPerfil = '';
      if (this.fotoPerfil) {
        const extension = this.fotoPerfil.name.split('.').pop()?.toLowerCase();
        nombreFotoPerfil = `${userId}.${extension}`;
        await this.imagenService.subirImagen(this.fotoPerfil, 'usuario', userId);
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
          await this.imagenService.subirImagen(this.fotoPerfilCriadero, 'criadero', idCriadero);

          await setDoc(doc(this.firestore, 'criaderos', idCriadero), {
            ...criaderoData,
            foto_perfil: nombreFotoCriadero
          });
        }

        // Subir archivos de documentación (NO guardar nombres en Firestore)
        if (this.documentacionFiles.length > 0) {
          for (const file of this.documentacionFiles) {
            await this.imagenService.subirImagen(file, 'documentacion', userId);
          }
          // No guardar la propiedad documentacion en Firestore
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
