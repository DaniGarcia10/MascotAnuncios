import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common'; 
import { PlantillasService } from '../../services/plantillas.service';
import { Plantilla } from '../../models/Plantilla.model';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth.service'; // Asegúrate de tener este servicio
import { DatosService } from '../../services/datos.service'; // Importa el servicio

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
  plantillaSeleccionada: string | null = null;
  idPlantillaAEliminar: string | null = null; // <-- Nueva propiedad

  constructor(
    private fb: FormBuilder,
    private plantillasService: PlantillasService,
    private authService: AuthService,
    private datosService: DatosService // Inyecta el servicio de datos
  ) {}

  ngOnInit(): void {
    this.formPlantilla = this.fb.group({
      nombrePlantilla: ['', Validators.required], 
      perro: [null, Validators.required],
      raza: [{ value: null, disabled: true }, Validators.required], // <-- Deshabilitado por defecto
      titulo: ['', Validators.required],
      descripcion: ['', [Validators.maxLength(360)]],
      edadValor: [null, Validators.required],
      edadUnidad: [null, Validators.required],
      id_usuario: [''],
      ubicacion: [null, Validators.required],
      precio: [null, [Validators.required, Validators.max(100000)]],
    });

    // Obtén el id del usuario autenticado y asígnalo al formulario
    const idUsuario = this.authService.getUsuarioId();
    this.formPlantilla.get('id_usuario')?.setValue(idUsuario);

    // Cargar provincias reales desde Firebase
    this.datosService.obtenerProvincias().then(provincias => {
      this.provincias = provincias;
    });

    // Cargar razas iniciales según el valor por defecto de 'perro'
    this.updateRazasList();

    // Habilita/deshabilita raza según el valor de 'perro'
    this.formPlantilla.get('perro')?.valueChanges.subscribe((valor) => {
      this.updateRazasList();
      this.formPlantilla.get('raza')?.setValue(null);
      if (valor === null || valor === undefined) {
        this.formPlantilla.get('raza')?.disable();
      } else {
        this.formPlantilla.get('raza')?.enable();
      }
    });

    // Inicializa el estado de raza según el valor inicial de 'perro'
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
    console.log('[DEBUG] ID de usuario para cargar plantillas:', idUsuario);
    if (!idUsuario) return; // Evita llamadas si no hay usuario
    this.plantillasService.getPlantillaByUsuario(idUsuario).subscribe(plantillas => {
      this.misPlantillas = plantillas;
      console.log('[DEBUG] Plantillas obtenidas:', plantillas);
    });
  }

  onSeleccionarPlantilla(id: string): void {
    const plantilla = this.misPlantillas.find(p => p.id === id);
    if (plantilla) {
      // Cargar nombre
      this.formPlantilla.get('nombrePlantilla')?.setValue(plantilla.nombre);

      // Cargar edad (ejemplo: "3 meses" o "5 semanas")
      if (plantilla.edad) {
        const [valor, unidad] = plantilla.edad.split(' ');
        this.formPlantilla.get('edadValor')?.setValue(Number(valor));
        this.formPlantilla.get('edadUnidad')?.setValue(unidad);
      } else {
        this.formPlantilla.get('edadValor')?.setValue(null);
        this.formPlantilla.get('edadUnidad')?.setValue(null);
      }

      // Cargar el resto de campos normalmente
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

    // Construir el objeto Plantilla a guardar
    const plantilla: Omit<Plantilla, 'id'> = {
      nombre: this.formPlantilla.get('nombrePlantilla')?.value,
      perro: this.formPlantilla.get('perro')?.value,
      raza: this.formPlantilla.get('raza')?.value,
      titulo: this.formPlantilla.get('titulo')?.value,
      descripcion: this.formPlantilla.get('descripcion')?.value,
      edad: `${this.formPlantilla.get('edadValor')?.value} ${this.formPlantilla.get('edadUnidad')?.value}`,
      id_usuario: this.formPlantilla.get('id_usuario')?.value,
      ubicacion: this.formPlantilla.get('ubicacion')?.value,
      precio: this.formPlantilla.get('precio')?.value,
    };

    this.plantillasService.crearPlantilla(plantilla)
      .then(() => {
        this.cargarMisPlantillas();
        this.nuevaPlantilla(); // Limpia el formulario tras guardar
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

  // Abre el modal y guarda el id de la plantilla a eliminar
  abrirModalEliminar(id: string): void {
    this.idPlantillaAEliminar = id;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalEliminarPlantilla'));
    modal.show();
  }

  // Confirma la eliminación
  confirmarEliminarPlantilla(): void {
    if (this.idPlantillaAEliminar) {
      this.plantillasService.eliminarPlantilla(this.idPlantillaAEliminar).then(() => {
        this.cargarMisPlantillas();
        this.idPlantillaAEliminar = null;
        // Cierra el modal
        const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalEliminarPlantilla'));
        modal.hide();
      });
    }
  }

  nuevaPlantilla(): void {
    this.formPlantilla.reset();
    // Vuelve a poner el id_usuario en el formulario
    const idUsuario = this.authService.getUsuarioId();
    this.formPlantilla.get('id_usuario')?.setValue(idUsuario);
  }

  getNombrePlantillaAEliminar(): string {
    const plantilla = this.misPlantillas.find(p => p.id === this.idPlantillaAEliminar);
    return plantilla ? plantilla.nombre : '';
  }
}
