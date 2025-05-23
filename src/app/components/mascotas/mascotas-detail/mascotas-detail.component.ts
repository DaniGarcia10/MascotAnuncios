import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MascotasService } from '../../../services/mascotas.service';
import { ArchivosService } from '../../../services/archivos.service';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgSelectModule } from '@ng-select/ng-select';
import { RAZAS } from '../../../data/razas';
import { Mascota } from '../../../models/Mascota.model';
import { from } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mascotas-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, MatSnackBarModule],
  templateUrl: './mascotas-detail.component.html',
  styleUrl: './mascotas-detail.component.css'
})
export class MascotasDetailComponent implements OnInit {
  formMascota: FormGroup;
  mascotaId: string | null = null;
  mascota: Mascota | null = null;
  isSubmitting = false;
  imagenesMascota: File[] = [];
  filteredRazas: { label: string; value: string }[] = [];
  imagenSeleccionada: number = 0;
  imagenesEliminadas: string[] = [];
  machos: Mascota[] = [];
  hembras: Mascota[] = [];
  mascotasUsuario: Mascota[] = [];

  constructor(
    private route: ActivatedRoute,
    private mascotasService: MascotasService,
    private fb: FormBuilder,
    private archivosService: ArchivosService,
    private firestore: Firestore,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {
    this.formMascota = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      perro: [null, Validators.required],
      raza: [null, [Validators.required]],
      color: ['', [Validators.required, Validators.maxLength(20)]],
      sexo: [null, Validators.required],
      descripcion: ['', [Validators.maxLength(200)]]
    });
    this.formMascota.addControl('id_padre', this.fb.control(''));
    this.formMascota.addControl('id_madre', this.fb.control(''));
  }

  ngOnInit(): void {
    this.mascotaId = this.route.snapshot.paramMap.get('id');
    if (this.mascotaId) {
      from(this.mascotasService.getMascotaById(this.mascotaId)).subscribe(mascota => {
        if (mascota) {
          this.mascota = mascota;
          this.imagenSeleccionada = 0;
          this.formMascota.patchValue({
            nombre: mascota.nombre,
            perro: mascota.perro,
            raza: mascota.raza,
            color: mascota.color,
            sexo: mascota.sexo,
            descripcion: mascota.descripcion,
            id_padre: mascota.id_padre || null,
            id_madre: mascota.id_madre || null 
          });
          this.updateRazasList();
          this.cargarMascotasUsuario();
        }
      });
    }

    this.formMascota.get('perro')?.valueChanges.subscribe(() => {
      this.updateRazasList();
      this.formMascota.get('raza')?.setValue(null);
      this.cargarMascotasUsuario();
    });
  }

  async cargarMascotasUsuario() {
    this.authService.getUserDataAuth().subscribe(async ({ user }) => {
      if (user) {
        this.mascotasService.getMascotas().subscribe(async mascotas => {
          this.mascotasUsuario = mascotas.filter(m => m.id_usuario === user.uid);

          // Procesar imágenes igual que en anuncios-form
          this.mascotasUsuario = await Promise.all(
            this.mascotasUsuario.map(async (mascota) => {
              if (mascota.imagenes && mascota.imagenes.length > 0) {
                const imagenesConRuta = mascota.imagenes.map(img =>
                  img.startsWith('http') ? img : `mascotas/${user.uid}/${img}`
                );
                try {
                  const urls = await this.archivosService.cargarImagenes(imagenesConRuta);
                  mascota.imagenes = urls;
                } catch (error) {
                  console.error(`Error al cargar imágenes de la mascota ${mascota.nombre}:`, error);
                }
              }
              return mascota;
            })
          );

          // Filtrar machos y hembras según el tipo seleccionado, excluyendo la mascota actual SIEMPRE
          const tipo = this.formMascota.get('perro')?.value;
          // Busca el id actual de la mascota editada (puede venir de this.mascota o del form)
          const idActual = this.mascotaId || this.mascota?.id;
          this.machos = this.mascotasUsuario.filter(m => m.perro === tipo && m.sexo?.toLowerCase() === 'macho' && m.id !== idActual);
          this.hembras = this.mascotasUsuario.filter(m => m.perro === tipo && m.sexo?.toLowerCase() === 'hembra' && m.id !== idActual);
        });
      }
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

  onFileSelectedMascota(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.imagenesMascota = Array.from(event.target.files);
    }
  }

  seleccionarImagen(index: number) {
    this.imagenSeleccionada = index;
  }

  imagenAnterior() {
    if (!this.mascota?.imagenes?.length) return;
    this.imagenSeleccionada =
      (this.imagenSeleccionada - 1 + this.mascota.imagenes.length) % this.mascota.imagenes.length;
  }

  imagenSiguiente() {
    if (!this.mascota?.imagenes?.length) return;
    this.imagenSeleccionada =
      (this.imagenSeleccionada + 1) % this.mascota.imagenes.length;
  }

  eliminarImagen(index: number) {
    if (this.mascota && this.mascota.imagenes && this.mascota.imagenes.length > index) {
      // Guardar el nombre de la imagen eliminada para borrarla del storage al guardar
      const img = this.mascota.imagenes[index];
      let nombreArchivo = img;
      try {
        if (img.includes('%2F')) {
          nombreArchivo = decodeURIComponent(img.split('%2F').pop()?.split('?')[0] || img);
        } else if (img.includes('/')) {
          nombreArchivo = decodeURIComponent(img.split('/').pop()?.split('?')[0] || img);
        }
      } catch {}
      this.imagenesEliminadas.push(nombreArchivo);

      this.mascota.imagenes.splice(index, 1);
      if (this.imagenSeleccionada >= this.mascota.imagenes.length) {
        this.imagenSeleccionada = Math.max(0, this.mascota.imagenes.length - 1);
      }
    }
  }

  cancelarCambios() {
    this.router.navigate(['/mascotas']);
  }

  seleccionarPadre(event: any): void {
    // Permitir tanto objeto como id (igual que anuncios-form)
    const id = typeof event === 'string' ? event : event?.id;
    // Evitar que la mascota se seleccione a sí misma como padre
    if (id && this.mascota && id === this.mascota.id) {
      this.snackBar.open('Una mascota no puede ser su propio padre.', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      this.formMascota.get('id_padre')?.setValue('');
      return;
    }
    this.formMascota.get('id_padre')?.setValue(id || '');
  }

  seleccionarMadre(event: any): void {
    // Permitir tanto objeto como id (igual que anuncios-form)
    const id = typeof event === 'string' ? event : event?.id;
    // Evitar que la mascota se seleccione a sí misma como madre
    if (id && this.mascota && id === this.mascota.id) {
      this.snackBar.open('Una mascota no puede ser su propia madre.', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      this.formMascota.get('id_madre')?.setValue('');
      return;
    }
    this.formMascota.get('id_madre')?.setValue(id || '');
  }

  async onSubmitMascota(): Promise<void> {
    if (!this.mascotaId) return;
    this.isSubmitting = true;
    const controls = this.formMascota.controls;

    // Validación de campos obligatorios (igual que en mascotas-list)
    const errores: string[] = [];
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
    // Solo si no hay imágenes en la mascota ni nuevas imágenes seleccionadas
    const totalImagenes = (this.mascota?.imagenes?.length || 0) + (this.imagenesMascota?.length || 0);
    if (totalImagenes === 0) {
      errores.push('Debes añadir al menos una imagen.');
    }

    if (errores.length > 0) {
      this.snackBar.open(errores.join(' '), 'Cerrar', {
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      this.isSubmitting = false;
      return;
    }

    try {
      let imagenesNombres: string[] = [];
      if (this.mascota?.imagenes) {
        // Siempre parte de las imágenes actuales (ya sean URLs o nombres)
        imagenesNombres = this.mascota.imagenes.map(img => {
          try {
            if (img.includes('%2F')) {
              const nombreCodificado = img.split('%2F').pop()?.split('?')[0] || img;
              return decodeURIComponent(nombreCodificado);
            }
            if (img.includes('/')) {
              return decodeURIComponent(img.split('/').pop()?.split('?')[0] || img);
            }
            return img;
          } catch {
            return img;
          }
        });
      }

      // Si se han subido nuevas imágenes, súmalas al array
      if (this.imagenesMascota.length > 0 && this.mascota) {
        for (const file of this.imagenesMascota) {
          const nombreArchivo = await this.archivosService.subirImagen(
            file,
            'mascota',
            this.mascota.id_usuario
          );
          imagenesNombres.push(nombreArchivo);
        }
      }

      // Eliminar imágenes del storage si corresponde
      if (this.imagenesEliminadas.length > 0 && this.mascota) {
        try {
          await this.archivosService.eliminarImagenes('mascota', this.mascota.id_usuario, this.imagenesEliminadas);
        } catch (e) {
          console.warn('No se pudo eliminar del storage:', e);
        }
        this.imagenesEliminadas = [];
      }

      const mascotaActualizada: any = {
        nombre: controls['nombre'].value,
        perro: controls['perro'].value,
        raza: controls['raza'].value,
        color: controls['color'].value,
        sexo: controls['sexo'].value,
        descripcion: controls['descripcion'].value,
        id_padre: controls['id_padre'].value || '',
        id_madre: controls['id_madre'].value || '',
        imagenes: imagenesNombres
      };

      const mascotaRef = doc(this.firestore, 'mascotas', this.mascotaId);
      await updateDoc(mascotaRef, mascotaActualizada);

      this.snackBar.open('Mascota actualizada correctamente.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });
      this.router.navigate(['/mascotas']);
    } catch (error) {
      this.snackBar.open('Error al actualizar la mascota.', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
    this.isSubmitting = false;
  }
}
