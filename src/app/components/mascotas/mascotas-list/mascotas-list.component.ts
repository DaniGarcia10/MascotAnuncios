import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RAZAS } from '../../../data/razas';
import { MascotasService } from '../../../services/mascotas.service';
import { Mascota } from '../../../models/Mascota.model';
import { MascotasResumeComponent } from '../mascotas-resume/mascotas-resume.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ImagenService } from '../../../services/imagen.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Firestore, collection, addDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mascotas-list',
  standalone: true,
  imports: [CommonModule, MascotasResumeComponent, ReactiveFormsModule, NgSelectModule, MatSnackBarModule], // Añadir MatSnackBarModule
  templateUrl: './mascotas-list.component.html',
  styleUrls: ['./mascotas-list.component.css']
})
export class MascotasListComponent implements OnInit {
  mascotas: Mascota[] = [];
  activeSection: string = 'ver';
  formMascota: FormGroup;
  isSubmittingMascota = false;
  imagenesMascota: File[] = [];
  filteredRazas: { label: string; value: string }[] = [];
  mascotasUsuario: Mascota[] = [];
  machos: Mascota[] = [];
  hembras: Mascota[] = [];
  mascotaDetalle: Mascota | null = null;

  constructor(
    private mascotasService: MascotasService,
    private fb: FormBuilder,
    private authService: AuthService,
    private imagenService: ImagenService,
    private snackBar: MatSnackBar, // Añadir MatSnackBar
    private firestore: Firestore, // Agregar Firestore para guardar la mascota
    private router: Router // Añadir Router para navegación
  ) {
    this.formMascota = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      perro: [null, Validators.required],
      raza: [{ value: null, disabled: true }, [Validators.required]], // Inicialmente deshabilitado
      color: ['', [Validators.required, Validators.maxLength(20)]],
      sexo: [null, Validators.required],
      descripcion: ['', [Validators.maxLength(200)]],
      id_padre: [''],
      id_madre: ['']
    });
  }

  ngOnInit(): void {
    this.authService.getUserDataAuth().subscribe(({ user }) => {
      if (user) {
        this.mascotasService.getMascotas().subscribe(async data => {
          this.mascotas = data;
          // Filtrar solo las mascotas del usuario autenticado
          this.mascotasUsuario = data.filter(m => m.id_usuario === user.uid);

          // Procesar imágenes igual que en anuncios-form
          this.mascotasUsuario = await Promise.all(
            this.mascotasUsuario.map(async (mascota) => {
              if (mascota.imagenes && mascota.imagenes.length > 0) {
                const imagenesConRuta = mascota.imagenes.map(img =>
                  img.startsWith('http') ? img : `mascotas/${user.uid}/${img}`
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

          this.filtrarPadres();
        });
      }
    });

    // No cargar razas hasta que se seleccione el tipo
    this.filteredRazas = [];
    this.formMascota.get('perro')?.valueChanges.subscribe(() => {
      this.updateRazasList();
      // Habilitar o deshabilitar el control 'raza' según si hay tipo seleccionado
      const tipo = this.formMascota.get('perro')?.value;
      if (tipo === null || tipo === undefined) {
        this.formMascota.get('raza')?.disable();
      } else {
        this.formMascota.get('raza')?.enable();
      }
      this.formMascota.get('raza')?.setValue(null);
      this.filtrarPadres();
    });

    // Ya no es necesario: this.formMascota.get('raza')?.disable();

    // Actualizar machos y hembras al cambiar el sexo (por si acaso)
    this.formMascota.get('sexo')?.valueChanges.subscribe(() => {
      this.filtrarPadres();
    });
  }

  updateRazasList(): void {
    const tipo = this.formMascota.get('perro')?.value;
    if (tipo === null || tipo === undefined) {
      this.filteredRazas = [];
      return;
    }
    const tipoStr = tipo ? 'perros' : 'gatos';
    this.filteredRazas = (RAZAS[tipoStr] || []).map(raza => ({ label: raza, value: raza }));
  }

  filtrarPadres(): void {
    // Filtra machos y hembras según el tipo seleccionado
    const tipo = this.formMascota.get('perro')?.value;
    this.machos = this.mascotasUsuario.filter(m => m.perro === tipo && m.sexo?.toLowerCase() === 'macho');
    this.hembras = this.mascotasUsuario.filter(m => m.perro === tipo && m.sexo?.toLowerCase() === 'hembra');
  }

  seleccionarPadre(event: any): void {
    // Permitir tanto objeto como id (igual que en detail)
    const id = typeof event === 'string' ? event : event?.id;
    this.formMascota.get('id_padre')?.setValue(id || '');
  }

  seleccionarMadre(event: any): void {
    // Permitir tanto objeto como id (igual que en detail)
    const id = typeof event === 'string' ? event : event?.id;
    this.formMascota.get('id_madre')?.setValue(id || '');
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  onFileSelectedMascota(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.imagenesMascota = Array.from(event.target.files);
    }
  }

  async onSubmitMascota(): Promise<void> {
    if (this.isSubmittingMascota) return;
    this.isSubmittingMascota = true;

    // Validación de campos obligatorios
    const errores: string[] = [];
    const controls = this.formMascota.controls;

    if (controls['nombre'].invalid) {
      errores.push('El nombre es obligatorio.');
      controls['nombre'].markAsTouched();
    }
    if (controls['perro'].invalid) {
      errores.push('El tipo (perro/gato) es obligatorio.');
      controls['perro'].markAsTouched();
    }
    if (controls['raza'].invalid) {
      errores.push('La raza es obligatoria.');
      controls['raza'].markAsTouched();
    }
    if (controls['color'].invalid) {
      errores.push('El color es obligatorio.');
      controls['color'].markAsTouched();
    }
    if (controls['sexo'].invalid) {
      errores.push('El sexo es obligatorio.');
      controls['sexo'].markAsTouched();
    }
    if (!this.imagenesMascota || this.imagenesMascota.length === 0) {
      errores.push('Debes añadir al menos una imagen.');
    }

    if (errores.length > 0) {
      this.snackBar.open(errores.join(' '), 'Cerrar', {
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      this.isSubmittingMascota = false;
      return;
    }

    try {
      const userData = await this.authService.getUserDataAuth().toPromise();
      const user: any = userData && (userData as any).user ? (userData as any).user : null;
      if (!user) {
        this.snackBar.open('Usuario no autenticado.', 'Cerrar', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
        this.isSubmittingMascota = false;
        return;
      }

      // Subir imágenes nuevas y obtener nombres de archivo
      let imagenesNombres: string[] = [];
      if (this.imagenesMascota && this.imagenesMascota.length > 0) {
        for (const file of this.imagenesMascota) {
          const nombreArchivo = await this.imagenService.subirImagen(
            file,
            'mascota',
            user.uid
          );
          imagenesNombres.push(nombreArchivo);
        }
      }

      // Construir objeto mascota
      const mascota: any = {
        nombre: controls['nombre'].value,
        perro: controls['perro'].value,
        raza: controls['raza'].value,
        color: controls['color'].value,
        sexo: controls['sexo'].value,
        descripcion: controls['descripcion'].value,
        id_padre: controls['id_padre'].value || '',
        id_madre: controls['id_madre'].value || '',
        imagenes: imagenesNombres,
        id_usuario: user.uid,
        fecha_creacion: new Date()
      };

      // Guardar mascota en Firestore
      await addDoc(collection(this.firestore, 'mascotas'), mascota);

      this.snackBar.open('Mascota añadida correctamente.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });

      this.formMascota.reset({ perro: true, sexo: 'Macho' });
      this.imagenesMascota = [];
      this.updateRazasList();
      this.filtrarPadres();
      this.activeSection = 'ver';
    } catch (error) {
      this.snackBar.open('Error al guardar la mascota.', 'Cerrar', {
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      console.error(error);
    } finally {
      this.isSubmittingMascota = false;
    }
  }

  mostrarDetallesMascota(mascota: Mascota) {
    this.mascotaDetalle = mascota;
  }

  cerrarDetallesMascota() {
    this.mascotaDetalle = null;
  }

  async eliminarMascotaDetalle() {
    if (!this.mascotaDetalle || !this.mascotaDetalle.id) return;
    const confirmacion = confirm(`¿Deseas eliminar a ${this.mascotaDetalle.nombre}?`);
    if (!confirmacion) return;
    const mascotaRef = doc(this.firestore, 'mascotas', this.mascotaDetalle.id);
    try {
      await deleteDoc(mascotaRef);
      this.snackBar.open('Mascota eliminada correctamente.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });
      this.cerrarDetallesMascota();
    } catch (err) {
      this.snackBar.open('Error al eliminar la mascota.', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  }

  editarMascotaDetalle() {
    if (!this.mascotaDetalle || !this.mascotaDetalle.id) {
      return;
    }
    const id = this.mascotaDetalle.id;
    this.cerrarDetallesMascota();
    this.router.navigate(['/mascotas', id]);
  }
}
