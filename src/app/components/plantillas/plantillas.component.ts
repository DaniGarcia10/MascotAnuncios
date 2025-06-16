import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { PlantillasService } from '../../services/plantillas.service';
import { Plantilla } from '../../models/Plantilla.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-plantillas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './plantillas.component.html',
  styleUrl: './plantillas.component.css'
})
export class PlantillasComponent implements OnInit {
  formPlantilla!: FormGroup;
  filteredRazas: { label: string; value: string }[] = [];
  provincias: string[] = [];
  isSubmitting = false;
  misPlantillas: Plantilla[] = [];
  idPlantillaAEliminar: string | null = null;
  plantillaSeleccionadaId: string | null = null;
  cargandoPlantillas = false; // NUEVO

  constructor(
    private fb: FormBuilder,
    private plantillasService: PlantillasService,
    private authService: AuthService,
    private datosService: DatosService
  ) {}

  ngOnInit(): void {
    this.formPlantilla = this.fb.group({
      nombrePlantilla: ['', Validators.required],
      perro: [null, Validators.required],
      raza: [{ value: null, disabled: true }, Validators.required],
      titulo: ['', Validators.required],
      descripcion: ['', [Validators.maxLength(360)]],
      edadValor: [null, Validators.required],
      edadUnidad: [null, Validators.required],
      id_usuario: [''],
      ubicacion: [null, Validators.required],
      precio: [null, [Validators.required, Validators.max(100000)]],
    });

    const idUsuario = this.authService.getUsuarioId();
    this.formPlantilla.get('id_usuario')?.setValue(idUsuario);

    this.datosService.obtenerProvincias().then(provincias => {
      this.provincias = provincias;
    });

    this.updateRazasList();

    this.formPlantilla.get('perro')?.valueChanges.subscribe((valor) => {
      this.updateRazasList();
      this.formPlantilla.get('raza')?.setValue(null);
      if (valor === null || valor === undefined) {
        this.formPlantilla.get('raza')?.disable();
      } else {
        this.formPlantilla.get('raza')?.enable();
      }
    });

    if (!this.formPlantilla.get('perro')?.value) {
      this.formPlantilla.get('raza')?.disable();
    } else {
      this.formPlantilla.get('raza')?.enable();
    }

    this.cargarMisPlantillas();
  }

  updateRazasList(): void {
    const tipo = this.formPlantilla.get('perro')?.value ? 'perro' : 'gato';
    this.datosService.obtenerRazas(tipo).then(razas => {
      this.filteredRazas = razas.map(r => ({ label: r, value: r }));
    });
  }

  cargarMisPlantillas(): void {
    const idUsuario = this.formPlantilla.get('id_usuario')?.value;
    if (!idUsuario) return;
    this.cargandoPlantillas = true; 
    this.plantillasService.getPlantillaByUsuario(idUsuario).subscribe(plantillas => {
      this.misPlantillas = plantillas;
      this.cargandoPlantillas = false;
    }, () => {
      this.cargandoPlantillas = false;
    });
  }

  onSeleccionarPlantilla(id: string): void {
    const plantilla = this.misPlantillas.find(p => p.id === id);
    if (plantilla) {
      this.plantillaSeleccionadaId = id;

      this.formPlantilla.get('nombrePlantilla')?.setValue(plantilla.nombre);

      if (plantilla.edad) {
        const [valor, unidad] = plantilla.edad.split(' ');
        this.formPlantilla.get('edadValor')?.setValue(Number(valor));
        this.formPlantilla.get('edadUnidad')?.setValue(unidad);
      } else {
        this.formPlantilla.get('edadValor')?.setValue(null);
        this.formPlantilla.get('edadUnidad')?.setValue(null);
      }

      this.formPlantilla.patchValue({
        perro: plantilla.perro,
        raza: plantilla.raza,
        titulo: plantilla.titulo,
        descripcion: plantilla.descripcion,
        ubicacion: plantilla.ubicacion,
        precio: plantilla.precio
      });
    }
  }

  onSubmit(): void {
  this.isSubmitting = true;
  this.formPlantilla.markAllAsTouched();
  if (this.formPlantilla.invalid) {
    this.isSubmitting = false;
    return;
  }

  const idUsuario = this.formPlantilla.get('id_usuario')?.value;
  const nombreFormulario = this.formPlantilla.get('nombrePlantilla')?.value;

  const plantilla: Omit<Plantilla, 'id'> = {
    nombre: nombreFormulario,
    perro: this.formPlantilla.get('perro')?.value,
    raza: this.formPlantilla.get('raza')?.value,
    titulo: this.formPlantilla.get('titulo')?.value,
    descripcion: this.formPlantilla.get('descripcion')?.value,
    edad: `${this.formPlantilla.get('edadValor')?.value} ${this.formPlantilla.get('edadUnidad')?.value}`,
    id_usuario: idUsuario,
    ubicacion: this.formPlantilla.get('ubicacion')?.value,
    precio: this.formPlantilla.get('precio')?.value,
  };

  // Buscar si ya existe una plantilla con ese nombre del mismo usuario
  const plantillaExistente = this.misPlantillas.find(p =>
    p.nombre === nombreFormulario && p.id_usuario === idUsuario
  );

  const operacion = plantillaExistente
    ? this.plantillasService.actualizarPlantilla(plantillaExistente.id!, plantilla)
    : this.plantillasService.crearPlantilla(plantilla);

  operacion
    .then(() => {
      this.cargarMisPlantillas();
      this.nuevaPlantilla();
    })
    .finally(() => {
      this.isSubmitting = false;
    });
  }

  eliminarPlantilla(id: string): void {
    if (!id) return;
    if (confirm('¿Seguro que deseas eliminar esta plantilla?')) {
      this.plantillasService.eliminarPlantilla(id).then(() => {
        this.cargarMisPlantillas();
      });
    }
  }

  abrirModalEliminar(id: string): void {
    this.idPlantillaAEliminar = id;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalEliminarPlantilla'));
    modal.show();
  }

  confirmarEliminarPlantilla(): void {
    if (this.idPlantillaAEliminar) {
      this.plantillasService.eliminarPlantilla(this.idPlantillaAEliminar).then(() => {
        this.cargarMisPlantillas();
        this.idPlantillaAEliminar = null;
        const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalEliminarPlantilla'));
        modal.hide();
      });
    }
  }

  nuevaPlantilla(): void {
    this.formPlantilla.reset();
    this.plantillaSeleccionadaId = null;
    const idUsuario = this.authService.getUsuarioId();
    this.formPlantilla.get('id_usuario')?.setValue(idUsuario);
  }

  getNombrePlantillaAEliminar(): string {
    const plantilla = this.misPlantillas.find(p => p.id === this.idPlantillaAEliminar);
    return plantilla ? plantilla.nombre : '';
  }
}
