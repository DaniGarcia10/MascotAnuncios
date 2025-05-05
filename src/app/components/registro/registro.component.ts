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

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const usuario = this.formRegistro.value;

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

        const criaderosRef = collection(this.firestore, 'criaderos');
        const docRef = await addDoc(criaderosRef, criaderoData);
        idCriadero = docRef.id;

        if (this.fotoPerfilCriadero) {
          const extension = this.fotoPerfilCriadero.name.split('.').pop()?.toLowerCase();
          const nombreFotoCriadero = `${idCriadero}.${extension}`;
          await this.imagenService.subirImagen(this.fotoPerfilCriadero, 'criadero', idCriadero);

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
