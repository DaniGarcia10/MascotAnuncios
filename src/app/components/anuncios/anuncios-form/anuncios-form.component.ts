import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { RAZAS } from '../../../data/razas';
import { PROVINCIAS_ESPAÑA } from '../../../data/provincias';
import { Firestore, collection } from '@angular/fire/firestore';
import { ImagenService } from '../../../services/imagen.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AnunciosService } from '../../../services/anuncios.service';
import { MascotasService } from '../../../services/mascotas.service';
import { Mascota } from '../../../models/Mascota.model';

@Component({
  selector: 'app-anuncios-form',
  standalone: true,
  templateUrl: './anuncios-form.component.html',
  styleUrls: ['./anuncios-form.component.css'],
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, FormsModule, MatSnackBarModule],
})
export class AnunciosFormComponent implements OnInit {
  formAnuncio!: FormGroup;
  provincias = PROVINCIAS_ESPAÑA;
  filteredRazas: { label: string; value: string }[] = [];
  especificarPadres: boolean = false;
  isSubmitting: boolean = false; // Nueva variable
  mascotasUsuario: Mascota[] = []; // Lista de mascotas del usuario
  machos: Mascota[] = []; // Mascotas machos
  hembras: Mascota[] = []; // Mascotas hembras

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private imagenService: ImagenService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private anunciosService: AnunciosService,
    private mascotasService: MascotasService
  ) {}

  ngOnInit(): void {
    this.formAnuncio = this.fb.group({
      perro: [null, Validators.required],
      raza: [null, Validators.required],
      titulo: ['', Validators.required],
      descripcion: [''],
      fecha_publicacion: new Date().toISOString(),
      id_padre: [null],
      id_madre: [null],
      edad: [''],
      edadValor: [null, Validators.required],
      edadUnidad: [null, Validators.required],
      id_usuario: [''], 
      activo: [true],
      ubicacion: [null, Validators.required],
      imagenes: [[], Validators.required],
      cachorros: this.fb.array([]),
      especificar_cachorros: [false],
      precio: [null],
      destacado: [null],
      especificarPadres: [false], 
    });

    // Obtener el usuario autenticado y asignar su ID al formulario
    this.authService.getUserDataAuth().subscribe(({ user }) => {
      if (user) {
        this.formAnuncio.get('id_usuario')?.setValue(user.uid); 
        this.cargarMascotasUsuario(user.uid);
      }
    });

    this.formAnuncio.get('perro')?.valueChanges.subscribe(() => {
      this.updateRazasList();
      this.formAnuncio.get('raza')?.setValue(null);
    });

    this.formAnuncio.get('especificar_cachorros')?.valueChanges.subscribe(value => {
      if (value) {
        if (this.cachorros.length === 0) {
          this.cachorros.push(
            this.fb.group({
              color: [''],
              sexo: ['', Validators.required],
              precio: [null, Validators.required],
              disponible: [true],
              descripcion: [''],
              imagenes: [[], Validators.required],
            })
          );
        }
      } else {
        this.clearCachorros();
      }
    });
  }

  cargarMascotasUsuario(userId: string): void {
    this.mascotasService.getMascotas().subscribe({
      next: async (mascotas) => {
        this.mascotasUsuario = mascotas.filter((mascota) => mascota.id_usuario === userId);

        // Procesar imágenes de las mascotas
        this.mascotasUsuario = await Promise.all(
          this.mascotasUsuario.map(async (mascota) => {
            if (mascota.imagenes && mascota.imagenes.length > 0) {
              const imagenesConRuta = mascota.imagenes.map((img) =>
                img.startsWith('http') ? img : `mascotas/${userId}/${img}`
              );
              try {
                const urls = await this.imagenService.cargarImagenes(imagenesConRuta);
                mascota.imagenes = urls; 
              } catch (error) {
                console.error(`Error al cargar imágenes de la mascota ${mascota.nombre}:`, error);
              }
            }
            return mascota;
          })
        );

        // Filtrar machos y hembras
        this.machos = this.mascotasUsuario.filter((mascota) => mascota.sexo?.toLowerCase() === 'macho');
        this.hembras = this.mascotasUsuario.filter((mascota) => mascota.sexo?.toLowerCase() === 'hembra');
      },
      error: (err) => {
        console.error('Error al cargar las mascotas del usuario:', err);
      },
    });
  }

  private seleccionarMascota(event: any, controlName: string): void {
    const id = typeof event === 'string' ? event : event?.id; // Asegurarse de obtener solo el ID
    this.formAnuncio.get(controlName)?.setValue(id);
  }

  seleccionarPadre(event: any): void {
    this.seleccionarMascota(event, 'id_padre');
  }

  seleccionarMadre(event: any): void {
    this.seleccionarMascota(event, 'id_madre');
  }

  updateRazasList(): void {
    const tipo = this.formAnuncio.get('perro')?.value ? 'perros' : 'gatos';
    this.filteredRazas = (RAZAS[tipo] || []).map(raza => ({ label: raza, value: raza }));
  }

  get cachorros(): FormArray {
    return this.formAnuncio.get('cachorros') as FormArray;
  }

  setNumeroCachorros(event: any): void {
    const num = parseInt((event.target as HTMLSelectElement).value, 10); // Casting explícito
    this.clearCachorros();
    for (let i = 0; i < num; i++) {
      this.cachorros.push(
        this.fb.group({
          color: [''],
          sexo: ['', Validators.required],
          precio: [null, Validators.required],
          disponible: [true],
          descripcion: [''],
          imagenes: [[], Validators.required],
        })
      );
    }
  }

  clearCachorros(): void {
    this.cachorros.clear();
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    const fileArray = Array.from(files) as File[]; // Convertir a un array de File
    this.formAnuncio.get('imagenes')?.setValue(fileArray); // Guardar los archivos completos
    this.formAnuncio.get('imagenes')?.markAsTouched();
    console.log(this.formAnuncio.get('imagenes')?.value);
  }

  onCachorroFileSelected(event: any, i: number): void {
    const files = event.target.files;
    const fileArray = Array.from(files) as File[]; 
    this.cachorros.at(i).get('imagenes')?.setValue(fileArray); 
    this.cachorros.at(i).get('imagenes')?.markAsTouched();
    console.log(this.cachorros.at(i).get('imagenes')?.value);
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return; // Evitar múltiples envíos
    this.isSubmitting = true;

    const errores: string[] = [];
    const controls = this.formAnuncio.controls;

    if (controls['perro'].invalid) {
      errores.push('El tipo (perro/gato) es obligatorio.');
      controls['perro'].markAsTouched();
    }
    if (controls['raza'].invalid) {
      errores.push('La raza es obligatoria.');
      controls['raza'].markAsTouched();
    }
    if (controls['titulo'].invalid) {
      errores.push('El título es obligatorio.');
      controls['titulo'].markAsTouched();
    }
    if (controls['edadValor'].invalid) {
      errores.push('La edad es obligatoria.');
      controls['edadValor'].markAsTouched();
    }
    if (controls['edadUnidad'].invalid) {
      errores.push('La unidad de edad es obligatoria.');
      controls['edadUnidad'].markAsTouched();
    }
    if (controls['ubicacion'].invalid) {
      errores.push('La provincia es obligatoria.');
      controls['ubicacion'].markAsTouched();
    }
    if (!controls['imagenes'].value || controls['imagenes'].value.length === 0) {
      errores.push('Debe subir al menos una imagen.');
      controls['imagenes'].markAsTouched();
    }

    // Validación de cachorros si corresponde
    if (controls['especificar_cachorros'].value && this.cachorros.length > 0) {
      this.cachorros.controls.forEach((cachorro, i) => {
        if (cachorro.get('sexo')?.invalid) {
          errores.push(`El sexo del cachorro ${i + 1} es obligatorio.`);
          cachorro.get('sexo')?.markAsTouched();
        }
        if (cachorro.get('precio')?.invalid) {
          errores.push(`El precio del cachorro ${i + 1} es obligatorio.`);
          cachorro.get('precio')?.markAsTouched();
        }
        if (!cachorro.get('imagenes')?.value || cachorro.get('imagenes')?.value.length === 0) {
          errores.push(`Debe subir al menos una imagen para el cachorro ${i + 1}.`);
          cachorro.get('imagenes')?.markAsTouched();
        }
      });
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
      await this.anunciosService.subirAnuncio(this.formAnuncio.value);
      this.snackBar.open('¡Anuncio publicado exitosamente!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });
      this.router.navigate(['/mis-anuncios']);
    } catch (error) {
      console.error('Error al publicar el anuncio:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
