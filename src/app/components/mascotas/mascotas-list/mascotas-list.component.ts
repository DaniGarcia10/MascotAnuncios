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

  constructor(
    private mascotasService: MascotasService,
    private fb: FormBuilder,
    private authService: AuthService,
    private imagenService: ImagenService,
    private snackBar: MatSnackBar // Añadir MatSnackBar
  ) {
    this.formMascota = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      perro: [null, Validators.required],
      raza: [null, [Validators.required]],
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
      this.formMascota.get('raza')?.setValue(null);
      this.filtrarPadres();
    });
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
    const tipo = this.formMascota.get('perro')?.value;
    this.machos = this.mascotasUsuario.filter(m => m.perro === tipo && m.sexo?.toLowerCase() === 'macho');
    this.hembras = this.mascotasUsuario.filter(m => m.perro === tipo && m.sexo?.toLowerCase() === 'hembra');
  }

  seleccionarPadre(event: any): void {
    this.formMascota.get('id_padre')?.setValue(event || '');
  }

  seleccionarMadre(event: any): void {
    this.formMascota.get('id_madre')?.setValue(event || '');
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  onFileSelectedMascota(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.imagenesMascota = Array.from(event.target.files);
    }
  }

  onSubmitMascota(): void {
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
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error'],
        duration: 6000
      });
      this.isSubmittingMascota = false;
      return;
    }

    // Aquí iría la lógica para guardar la mascota
    setTimeout(() => {
      this.isSubmittingMascota = false;
      this.formMascota.reset({ perro: true, sexo: 'Macho' });
      this.imagenesMascota = [];
      // Podrías mostrar un mensaje de éxito aquí
    }, 1000);
  }
}
