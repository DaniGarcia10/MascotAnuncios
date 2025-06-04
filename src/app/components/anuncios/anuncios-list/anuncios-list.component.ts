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
    tipoAnimal: null,
    raza: null,
    ubicacion: null as string | null,
    precioMin: null,
    precioMax: null
  };

  razas: { label: string, value: string }[] = [];
  filteredRazas: { label: string, value: string }[] = [];

  provincias: { label: string, value: string }[] = [];

  constructor(
    private anunciosService: AnunciosService,
    private route: ActivatedRoute,
    private datosService: DatosService
  ) { }

  async ngOnInit(): Promise<void> {
  this.esMovil = window.innerWidth < 768;
  window.addEventListener('resize', () => {
    this.esMovil = window.innerWidth < 768;
  });

  const provincias = await this.datosService.obtenerProvincias();
  this.provincias = (provincias || []).map(p => ({ label: p, value: p }));

  // Única suscripción y toda la lógica aquí
  this.route.queryParams.subscribe(params => {
    this.filtros.tipoAnimal = params['tipoAnimal'] ?? null;
    this.filtros.raza = params['raza'] ?? null;

    this.cargarAnuncios();
  });
}

  private cargarAnuncios(): void {
  this.cargando = true;
  this.anuncios = [];
  this.anunciosFiltrados = [];

  this.anunciosService.getAnuncios().subscribe(data => {
    this.anuncios = data;
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
    const tipo = this.filtros.tipoAnimal as 'perro' | 'gato';
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
    const tipo = this.filtros.tipoAnimal as 'perro' | 'gato';
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
    if (!this.anuncios || this.anuncios.length === 0) {
      return; // No hay anuncios para ordenar
    }

    // Si no hay anuncios filtrados todavía, copia todos los anuncios
    if (!this.anunciosFiltrados || this.anunciosFiltrados.length === 0) {
      this.anunciosFiltrados = [...this.anuncios];
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

  detectarUbicacion(): void {
    if (!navigator.geolocation) {
      this.usarUbicacionPorIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          .then(res => res.json())
          .then(data => {
            console.log('Datos GPS:', data);

            const direccion = data.address;
            const posibles = [
              direccion.city,
              direccion.town,
              direccion.village,
              direccion.county,
              direccion.state_district
            ];

            const nombreDetectado = posibles.find(nombre => !!nombre);

            if (!nombreDetectado) {
              console.warn('No se encontró ningún campo de ubicación útil');
              this.usarUbicacionPorIP();
              return;
            }

            // Buscar la provincia por coincidencia parcial
            const provinciaEncontrada = this.provincias.find(p =>
              nombreDetectado.toLowerCase().includes(p.label.toLowerCase()) ||
              p.label.toLowerCase().includes(nombreDetectado.toLowerCase())
            );

            if (provinciaEncontrada) {
              this.filtros.ubicacion = provinciaEncontrada.value;
            } else {
              console.warn('No se pudo mapear correctamente a una provincia:', nombreDetectado);
              this.filtros.ubicacion = null;
            }
          })
          .catch((error) => {
            console.error('Error Nominatim:', error);
            this.usarUbicacionPorIP();
          });
      },
      (error) => {
        console.warn('Error GPS:', error.message);
        this.usarUbicacionPorIP();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }


  usarUbicacionPorIP(): void {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        console.log('Datos por IP:', data);
        const provincia = data.region; 

        const provinciaEncontrada = this.provincias.find(p => p.label.toLowerCase() === provincia.toLowerCase());
        if (provinciaEncontrada) {
          this.filtros.ubicacion = provinciaEncontrada.value;
        } else {
          console.warn('Provincia no encontrada por IP:', provincia);
          alert('No se pudo detectar tu provincia.');
        }
      })
      .catch((error) => {
        console.error('Error IP geolocation:', error);
        alert('No se pudo detectar tu ubicación.');
      });
  }



}
