import { Component, OnInit } from '@angular/core';
import { AnunciosService } from '../../../services/anuncios.service';
import { FormsModule } from '@angular/forms';
import { AnunciosResumeComponent } from '../anuncios-resume/anuncios-resume.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-anuncios-list',
  imports: [FormsModule, AnunciosResumeComponent, CommonModule],
  templateUrl: './anuncios-list.component.html',
  styleUrls: ['./anuncios-list.component.css'],
})
export class AnunciosListComponent implements OnInit {
  anuncios: any[] = [];
  anunciosFiltrados: any[] = [];
  ordenSeleccionado: string = ''; // Guardar el tipo de orden


  filtros = {
    tipoAnimal: '',
    raza: '',
    ubicacion: '',
    precioMin: null,
    precioMax: null
  };

  constructor(private anunciosService: AnunciosService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filtros.tipoAnimal = params['tipoAnimal'] || '';
      this.filtros.raza = params['raza'] || '';
  
      this.anunciosService.getAnuncios().subscribe(data => {
        this.anuncios = data;
        this.aplicarFiltros(); // Aplicar filtros directamente
      });
    });
  }
  

  aplicarFiltros(): void {
    this.anunciosFiltrados = this.anuncios.filter(anuncio => {
      const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Normalizar cadenas

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
        ? normalize(anuncio.raza || '').toLowerCase().includes(normalize(this.filtros.raza).toLowerCase())
        : true;

      return cumpleUbicacion && cumplePrecioMin && cumplePrecioMax && cumpleTipoAnimal && cumpleRaza;
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
            if (data.address?.city) {
              this.filtros.ubicacion = data.address.city;
            } else if (data.address?.town) {
              this.filtros.ubicacion = data.address.town;
            } else if (data.address?.village) {
              this.filtros.ubicacion = data.address.village;
            } else {
              this.filtros.ubicacion = data.display_name; // fallback
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
        this.filtros.ubicacion = data.city;
      })
      .catch((error) => {
        console.error('Error IP geolocation:', error);
        alert('No se pudo detectar tu ubicación.');
      });
  }
  

}
