import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MascotasService } from '../../../services/mascotas.service';
import { Mascota } from '../../../models/Mascota.model';
import { MascotasResumeComponent } from '../mascotas-resume/mascotas-resume.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ArchivosService } from '../../../services/archivos.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Firestore, collection, addDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { DatosService } from '../../../services/datos.service';

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
  modalEliminarMascotaAbierto = false;
  cargando: boolean = true; 

  constructor(
    private mascotasService: MascotasService,
    private fb: FormBuilder,
    private authService: AuthService,
    private archivosService: ArchivosService,
    private snackBar: MatSnackBar,
    private firestore: Firestore,
    private router: Router,
    private datosService: DatosService 
  ) {
    this.formMascota = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]], // Máximo 50 caracteres
      perro: [null, Validators.required],
      raza: [{ value: null, disabled: true }, [Validators.required]], // Obligatorio
      color: ['', [Validators.required, Validators.maxLength(20)]],
      sexo: [null, Validators.required],
      descripcion: ['', [Validators.maxLength(300)]], // Máximo 300 caracteres
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
                  const urls = await this.archivosService.cargarImagenes(imagenesConRuta);
                  mascota.imagenes = urls;
                } catch (error) {
                  console.error(`Error al cargar imágenes de la mascota ${mascota.nombre}:`, error);
                }
              }
              return mascota;
            })
          );

          this.filtrarPadres();
          this.cargando = false;
        });
      } else {
        this.cargando = false; 
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

    // Actualizar machos y hembras al cambiar el sexo (por si acaso)
    this.formMascota.get('sexo')?.valueChanges.subscribe(() => {
      this.filtrarPadres();
    });
  }

  async updateRazasList(): Promise<void> {
    const tipo = this.formMascota.get('perro')?.value;
    if (tipo === null || tipo === undefined) {
      this.filteredRazas = [];
      return;
    }
    const tipoStr: 'perro' | 'gato' = tipo ? 'perro' : 'gato';
    const razas = await this.datosService.obtenerRazas(tipoStr);
    this.filteredRazas = (razas || []).map(raza => ({ label: raza, value: raza }));
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
      const archivos: File[] = Array.from(event.target.files);
      const archivosValidos: File[] = [];
      let extensionInvalida = false;

      for (const file of archivos) {
        try {
          // Validar extensión usando el servicio
          this.archivosService['validarExtension'](file);
          archivosValidos.push(file);
        } catch (error: any) {
          extensionInvalida = true;
          const extension = file.name.split('.').pop()?.toLowerCase();
          // Mostrar modal de error en vez de snackbar
          const mensaje = `El formato "${extension}" no es válido. Formatos soportados: jpg, jpeg, png, webp, pdf.`;
          const modal = document.getElementById('modalErrorExtensionImagen');
          const mensajeElem = document.getElementById('mensajeErrorExtensionImagen');
          if (mensajeElem) mensajeElem.textContent = mensaje;
          if (modal && (window as any).bootstrap) {
            // @ts-ignore
            const bsModal = new (window as any).bootstrap.Modal(modal);
            bsModal.show();
          }
        }
      }

      if (extensionInvalida) {
        // Limpiar input y archivos si hay extensión inválida
        event.target.value = '';
        this.imagenesMascota = [];
      } else {
        this.imagenesMascota = archivosValidos;
      }
    }
  }

  async onSubmitMascota(): Promise<void> {
    if (this.isSubmittingMascota) {
      return;
    }
    this.isSubmittingMascota = true;

    // Marcar todos los campos como tocados para mostrar errores en el formulario
    Object.values(this.formMascota.controls).forEach(control => control.markAsTouched());

    const controls = this.formMascota.controls;

    // Validación de campos obligatorios (solo para cortar el submit)
    if (
      controls['nombre'].invalid ||
      controls['perro'].invalid ||
      controls['raza'].invalid || // raza obligatoria
      controls['color'].invalid ||
      controls['sexo'].invalid ||
      !this.imagenesMascota || this.imagenesMascota.length === 0 // mínimo una imagen
    ) {
      this.isSubmittingMascota = false;
      return;
    }

    // Cambia el await por una suscripción
    this.authService.getUserDataAuth().subscribe({
      next: async ({ user }) => {
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

        try {
          // Subir imágenes nuevas y obtener nombres de archivo
          let imagenesNombres: string[] = [];
          if (this.imagenesMascota && this.imagenesMascota.length > 0) {
            for (const file of this.imagenesMascota) {
              const nombreArchivo = await this.archivosService.subirImagen(
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
            id_usuario: user.uid
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
      },
      error: (err) => {
        this.snackBar.open('Error al obtener usuario.', 'Cerrar', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
        this.isSubmittingMascota = false;
      }
    });
  }

  mostrarDetallesMascota(mascota: Mascota) {
    this.mascotaDetalle = mascota;
  }

  cerrarDetallesMascota() {
    this.mascotaDetalle = null;
  }

  async eliminarMascotaDetalle() {
    if (!this.mascotaDetalle || !this.mascotaDetalle.id) return;
    // Elimina el confirm, ya no es necesario porque el modal ya confirma
    const mascotaRef = doc(this.firestore, 'mascotas', this.mascotaDetalle.id);
    try {
      // Eliminar imágenes del storage antes de eliminar el documento
      if (this.mascotaDetalle.imagenes && this.mascotaDetalle.imagenes.length > 0) {
        // Extraer nombres de archivo de las URLs o nombres simples
        const imagenesNombres = this.mascotaDetalle.imagenes.map(img => {
          try {
            if (img.includes('%2F')) {
              return decodeURIComponent(img.split('%2F').pop()?.split('?')[0] || img);
            }
            if (img.includes('/')) {
              return decodeURIComponent(img.split('/').pop()?.split('?')[0] || img);
            }
            return img;
          } catch {
            return img;
          }
        });
        await this.archivosService.eliminarImagenes(
          'mascota',
          this.mascotaDetalle.id_usuario,
          imagenesNombres
        );
      }

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

  abrirModalConfirmacionEliminarMascota() {
    this.modalEliminarMascotaAbierto = true;
    setTimeout(() => {
      const modal = document.getElementById('modalConfirmarEliminarMascota');
      if (modal) {
        // @ts-ignore
        const bsModal = new window.bootstrap.Modal(modal);
        bsModal.show();
        // Guardar referencia si quieres cerrar desde TS
        (this as any)._bsModalMascota = bsModal;
      }
    });
  }

  cerrarModalConfirmacionEliminarMascota() {
    this.modalEliminarMascotaAbierto = false;
    // @ts-ignore
    if ((this as any)._bsModalMascota) {
      // @ts-ignore
      (this as any)._bsModalMascota.hide();
    }
  }

  async confirmarEliminarMascota() {
    this.cerrarModalConfirmacionEliminarMascota();
    await this.eliminarMascotaDetalle();
  }
}
