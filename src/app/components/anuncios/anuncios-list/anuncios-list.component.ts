import { Component, OnInit } from '@angular/core';
import { AnunciosService } from '../../../services/anuncios.service';
import { FormsModule } from '@angular/forms';
import { AnunciosResumeComponent } from '../anuncios-resume/anuncios-resume.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { DatosService } from '../../../services/datos.service';

@Component({
  selector: 'app-anuncios-list',
  imports: [FormsModule, AnunciosResumeComponent, CommonModule, NgSelectModule],
  templateUrl: './anuncios-list.component.html',
  styleUrls: ['./anuncios-list.component.css'],
})
export class AnunciosListComponent implements OnInit {
  anuncios: any[] = [];
  anunciosFiltrados: any[] = [];
  ordenSeleccionado: string | null = null;
  mostrarFiltros: boolean = false;
  esMovil: boolean = false;
  cargando: boolean = true; 

  filtros = {
    tipoAnimal: null as 'perro' | 'gato' | null,
    raza: null as string | null,
    ubicacion: null as string | null,
    precioMin: null as number | null,
    precioMax: null as number | null
  };

  razas: { label: string, value: string }[] = [];
  filteredRazas: { label: string, value: string }[] = [];

  provincias: { label: string, value: string }[] = [];

  constructor(
    private readonly anunciosService: AnunciosService,
    private readonly route: ActivatedRoute,
    private readonly datosService: DatosService
  ) { }

  ngOnInit(): void {
    this.esMovil = window.innerWidth < 768;
    window.addEventListener('resize', () => {
      this.esMovil = window.innerWidth < 768;
    });

    (async () => {
      const provincias = await this.datosService.obtenerProvincias();
      this.provincias = (provincias || []).map(p => ({ label: p, value: p }));

      this.route.queryParams.subscribe(params => {
        this.filtros.tipoAnimal = params['tipoAnimal'] ?? null;
        this.filtros.raza = params['raza'] ?? null;

        this.cargarAnuncios();
      });
    })();
  }

  public cargarAnuncios(): void {
    this.cargando = true;
    this.anuncios = [];
    this.anunciosFiltrados = [];

    this.anunciosService.getAnuncios().subscribe(data => {
      // Filtrar solo los anuncios activos
      this.anuncios = data.filter(anuncio => anuncio.activo);
      this.updateRazasList().then(() => {
        this.aplicarFiltros();
        this.cargando = false;
      });
    });
}


  async updateRazasList(): Promise<void> {
    if (!this.filtros.tipoAnimal) {
      this.filteredRazas = [];
      return;
    }
    const tipo = this.filtros.tipoAnimal;
    const razas = await this.datosService.obtenerRazas(tipo);
    this.filteredRazas = (razas || []).map(raza => ({
      label: raza,
      value: raza
    }));
  }

  async onSearchRaza(event: { term: string; items: any[] }): Promise<void> {
    const searchTerm = event.term;
    if (!this.filtros.tipoAnimal) {
      this.filteredRazas = [];
      return;
    }
    const tipo = this.filtros.tipoAnimal;
    const allRazas = await this.datosService.obtenerRazas(tipo);

    this.filteredRazas = (allRazas || [])
      .filter(raza => raza.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(raza => ({
        label: raza,
        value: raza
      }));
  }

  forzarRecarga(): void {
  this.cargarAnuncios();
  }


  aplicarFiltros(): void {
    this.anunciosFiltrados = this.anuncios.filter(anuncio => {
      const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      const cumpleUbicacion = this.filtros.ubicacion
        ? normalize(anuncio.ubicacion || '').toLowerCase().includes(normalize(this.filtros.ubicacion).toLowerCase())
        : true;

      const cumplePrecioMin = this.filtros.precioMin != null
        ? anuncio.precio >= this.filtros.precioMin
        : true;

      const cumplePrecioMax = this.filtros.precioMax != null
        ? anuncio.precio <= this.filtros.precioMax
        : true;

      const cumpleTipoAnimal = this.filtros.tipoAnimal
        ? (this.filtros.tipoAnimal === 'perro' && anuncio.perro) ||
        (this.filtros.tipoAnimal === 'gato' && !anuncio.perro)
        : true;

      const cumpleRaza = this.filtros.raza
        ? normalize(anuncio.raza || '').toLowerCase() === normalize(this.filtros.raza).toLowerCase()
        : true;

      return cumpleUbicacion && cumplePrecioMin && cumplePrecioMax && cumpleTipoAnimal && cumpleRaza;
    });

    // Ordenar: destacados primero
    this.anunciosFiltrados.sort((a, b) => {
      if (a.destacado === b.destacado) return 0;
      return a.destacado ? -1 : 1;
    });
  }

  ordenarAnuncios(): void {
    if (!this.anunciosFiltrados || this.anunciosFiltrados.length === 0) {
      return; 
    }

    if (!this.ordenSeleccionado) {
      return; // No ordenar si no se seleccionó nada
    }

    switch (this.ordenSeleccionado) {
      case 'precioAsc':
        this.anunciosFiltrados.sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0));
        break;
      case 'precioDesc':
        this.anunciosFiltrados.sort((a, b) => (b.precio ?? 0) - (a.precio ?? 0));
        break;
      case 'fechaReciente':
        this.anunciosFiltrados.sort((a, b) => {
          const fechaA = new Date(a.fecha_publicacion).getTime();
          const fechaB = new Date(b.fecha_publicacion).getTime();
          return fechaB - fechaA;
        });
        break;
      case 'fechaAntigua':
        this.anunciosFiltrados.sort((a, b) => {
          const fechaA = new Date(a.fecha_publicacion).getTime();
          const fechaB = new Date(b.fecha_publicacion).getTime();
          return fechaA - fechaB;
        });
        break;
    }
  }

}
