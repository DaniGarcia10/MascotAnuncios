import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { RAZAS } from '../../../data/razas';
import { PROVINCIAS_ESPAÑA } from '../../../data/provincias';
import { ArchivosService } from '../../../services/archivos.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AnunciosService } from '../../../services/anuncios.service';
import { MascotasService } from '../../../services/mascotas.service';
import { SuscripcionesService } from '../../../services/suscripciones.service';
import { UsuarioService } from '../../../services/usuario.service';
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
  isSubmitting: boolean = false; 
  mascotasUsuario: Mascota[] = []; 
  machos: Mascota[] = [];
  hembras: Mascota[] = [];
  tieneSuscripcionActiva: boolean = false;
  cargandoSuscripcion = true;

  constructor(
    private fb: FormBuilder,
    private archivosService: ArchivosService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private anunciosService: AnunciosService,
    private mascotasService: MascotasService,
    private suscripcionesService: SuscripcionesService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.formAnuncio = this.fb.group({
      perro: [null, Validators.required],
      raza: [null, Validators.required],
      titulo: ['', Validators.required],
      descripcion: ['', [Validators.maxLength(360)]], 
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
      precio: [null, [Validators.required, Validators.max(100000)]],
      destacado: [null],
      especificarPadres: [false], 
      telefono: [null, [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    });

    // Obtener el usuario autenticado y asignar su ID al formulario
    this.authService.getUserDataAuth().subscribe(({ user }) => {
      if (user) {
        this.formAnuncio.get('id_usuario')?.setValue(user.uid); 
        this.cargarMascotasUsuario(user.uid);

        // Obtener el id de la suscripción y comprobar si está activa
        this.usuarioService.getIdSuscripcionByUsuarioId(user.uid).then(idSuscripcion => {
          if (idSuscripcion) {
            this.suscripcionesService.obtenerSuscripcion(idSuscripcion).subscribe(suscripcion => {
              this.formAnuncio.get('destacado')?.setValue(!!suscripcion && suscripcion.activa === true);
              this.cargandoSuscripcion = false;
            });
          } else {
            this.formAnuncio.get('destacado')?.setValue(false);
            this.cargandoSuscripcion = false;
          }
        });

        // Precargar el teléfono del usuario
        this.anunciosService.getTelefonoByIdUsuario(user.uid).then(telefono => {
          if (telefono) {
            this.formAnuncio.get('telefono')?.setValue(telefono);
          }
        });
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
              precio: [null, [Validators.required, Validators.max(100000)]],
              disponible: [true],
              descripcion: ['', Validators.maxLength(45)],
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
                const urls = await this.archivosService.cargarImagenes(imagenesConRuta);
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
          precio: [null, [Validators.required, Validators.max(100000)]],
          disponible: [true],
          descripcion: ['', Validators.maxLength(45)],
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
    const fileArray = Array.from(files) as File[];
    const archivosValidos: File[] = [];
    let errorDetectado = false;

    for (const file of fileArray) {
      try {
        // Validar extensión usando el servicio
        this.archivosService['validarExtension'](file);
        archivosValidos.push(file);
      } catch (error: any) {
        errorDetectado = true;
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
        break; // Salir del bucle al primer error
      }
    }

    if (errorDetectado) {
      // Limpiar input y control si hubo error
      event.target.value = '';
      this.formAnuncio.get('imagenes')?.setValue([]);
    } else {
      this.formAnuncio.get('imagenes')?.setValue(archivosValidos);
    }
    this.formAnuncio.get('imagenes')?.markAsTouched();
  }

  // Para los cachorros:
  onCachorroFileSelected(event: any, i: number): void {
    const files = event.target.files;
    const fileArray = Array.from(files) as File[];
    const archivosValidos: File[] = [];
    let errorDetectado = false;

    for (const file of fileArray) {
      try {
        this.archivosService['validarExtension'](file);
        archivosValidos.push(file);
      } catch (error: any) {
        errorDetectado = true;
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
        break; // Salir del bucle al primer error
      }
    }

    if (errorDetectado) {
      event.target.value = '';
      this.cachorros.at(i).get('imagenes')?.setValue([]);
    } else {
      this.cachorros.at(i).get('imagenes')?.setValue(archivosValidos);
    }
    this.cachorros.at(i).get('imagenes')?.markAsTouched();
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return; // Evitar múltiples envíos
    this.isSubmitting = true;

    // Marcar todos los campos del formulario como tocados para mostrar errores
    this.formAnuncio.markAllAsTouched();
    this.cachorros.controls.forEach(cachorro => cachorro.markAllAsTouched());

    if (this.formAnuncio.invalid) {
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

  destacarAnuncio(): void {
    // Redirige a la página de suscripciones y abre la sección de contratar
    this.router.navigate(['/suscripciones'], { queryParams: { contratar: 1 } });
  }
}
