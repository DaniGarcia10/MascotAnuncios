import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { RAZAS } from '../../../data/razas';
import { PROVINCIAS_ESPAÑA } from '../../../data/provincias';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { ImagenService } from '../../../services/imagen.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-anuncios-form',
  standalone: true,
  templateUrl: './anuncios-form.component.html',
  styleUrls: ['./anuncios-form.component.css'],
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, FormsModule],
})
export class AnunciosFormComponent implements OnInit {
  formAnuncio!: FormGroup;
  provincias = PROVINCIAS_ESPAÑA;
  filteredRazas: { label: string; value: string }[] = [];
  especificarPadres: boolean = false;
  isSubmitting: boolean = false; // Nueva variable

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private imagenService: ImagenService,
    private authService: AuthService 
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
      }
    });

    this.formAnuncio.get('perro')?.valueChanges.subscribe(() => {
      this.updateRazasList();
      this.formAnuncio.get('raza')?.setValue(null);
    });

    this.formAnuncio.get('especificar_cachorros')?.valueChanges.subscribe(value => {
      if (!value) this.clearCachorros();
    });
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

    if (this.formAnuncio.invalid) {
      this.formAnuncio.markAllAsTouched();
      this.isSubmitting = false;
      return;
    }

    const anuncioData = { ...this.formAnuncio.value };
    const imagenesAnuncio = anuncioData.imagenes as File[]; 
    const cachorrosData = anuncioData.cachorros || [];
    delete anuncioData.cachorros;

    try {
      // Subir imágenes del anuncio
      const imagenesAnuncioUrls = await Promise.all(
        imagenesAnuncio.map(async (file) => {
          return await this.imagenService.subirImagen(file, 'anuncio', '');
        })
      );
      anuncioData.imagenes = imagenesAnuncioUrls;

      // Guardar anuncio en Firestore
      const anunciosRef = collection(this.firestore, 'anuncios');
      const anuncioDocRef = await addDoc(anunciosRef, anuncioData);
      const id_anuncio = anuncioDocRef.id;

      // Subir datos de cachorros si existen
      for (const [index, cachorro] of cachorrosData.entries()) {
        const imagenesCachorro = cachorro.imagenes as File[];

        // Subir imágenes de los cachorros
        const imagenesCachorroUrls = await Promise.all(
          imagenesCachorro.map(async (file) => {
            return await this.imagenService.subirImagen(file, 'cachorro', '');
          })
        );
        cachorro.imagenes = imagenesCachorroUrls;

        const cachorrosRef = collection(this.firestore, 'cachorros');
        await addDoc(cachorrosRef, { ...cachorro, id_anuncio });
      }

      console.log('Anuncio y cachorros publicados correctamente.');
    } catch (error) {
      console.error('Error al publicar el anuncio:', error);
    } finally {
      this.isSubmitting = false; // Restablecer el estado si es necesario
    }
  }
}
