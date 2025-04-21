import { Component, OnInit } from '@angular/core';
import { AnunciosService } from '../../../services/anuncios.service';
import { FormsModule } from '@angular/forms';
import { AnunciosResumeComponent } from '../anuncios-resume/anuncios-resume.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-anuncios-list',
  imports: [FormsModule, AnunciosResumeComponent, CommonModule],
  templateUrl: './anuncios-list.component.html',
  styleUrls: ['./anuncios-list.component.css'],
})
export class AnunciosListComponent implements OnInit {
  anuncios: any[] = [];
  anunciosFiltrados: any[] = [];

  filtros = {
    tipoAnimal: '',
    raza: '',
    ubicacion: '',
    precioMin: null,
    precioMax: null
  };

  constructor(private anunciosService: AnunciosService) {}

  ngOnInit(): void {
    this.anunciosService.getAnuncios().subscribe(data => {
      this.anuncios = data;
      this.anunciosFiltrados = data;
    });
  }

  aplicarFiltros(): void {
    this.anunciosFiltrados = this.anuncios.filter(anuncio => {
      const cumpleUbicacion = this.filtros.ubicacion
        ? anuncio.ubicacion?.toLowerCase().includes(this.filtros.ubicacion.toLowerCase())
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
        ? anuncio.raza?.toLowerCase().includes(this.filtros.raza.toLowerCase())
        : true;

      return cumpleUbicacion && cumplePrecioMin && cumplePrecioMax && cumpleTipoAnimal && cumpleRaza;
    });
  }
}
