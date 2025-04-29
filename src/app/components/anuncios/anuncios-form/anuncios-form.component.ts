import { Component, OnInit } from '@angular/core';
import { Anuncio } from '../../../models/Anuncio.model';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { RAZAS } from '../../../data/razas'; // Importar RAZAS desde el archivo

@Component({
  selector: 'app-anuncios-form',
  templateUrl: './anuncios-form.component.html',
  imports: [FormsModule, NgSelectModule, CommonModule],
  styleUrls: ['./anuncios-form.component.css']
})
export class AnunciosFormComponent implements OnInit {
  anuncio: Anuncio = {
    id: '',
    raza: '',
    perro: null,
    titulo: '',
    descripcion: '',
    fecha_publicacion: new Date(),
    id_padre: '',
    id_madre: '',
    edad: '',
    id_usuario: '',
    activo: true,
    ubicacion: '',
    imagenes: [],
    cachorros: [],
    especificar_cachorros: false,
    precio: null,
    destacado: false
  };

  razas: { label: string, value: string }[] = [];
  filteredRazas: { label: string, value: string }[] = [];

  constructor() {}

  ngOnInit(): void {
    this.updateRazasList();
  }
  
  updateRazasList(): void {
    if (this.anuncio.perro === null) {
      this.filteredRazas = []; // No cargar razas si no se ha seleccionado el tipo
      return;
    }
    const tipo = this.anuncio.perro ? 'perros' : 'gatos';
    const razas = RAZAS[tipo];
    console.log('Razas cargadas:', razas);
    this.filteredRazas = (razas || []).map(raza => ({
      label: raza,
      value: raza
    }));
  }

  onSearchRaza(event: { term: string; items: any[] }): void {
    const searchTerm = event.term;
    const tipo = this.anuncio.perro ? 'perros' : 'gatos';
    const allRazas = RAZAS[tipo];
  
    this.filteredRazas = allRazas
      .filter(raza => raza.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(raza => ({
        label: raza,
        value: raza
      }));
  }

  // Llamar a esta función cuando cambie el tipo
  onTipoChange(): void {
    this.anuncio.raza = ''; 
    this.updateRazasList();
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      this.anuncio.imagenes = Array.from(files).map((file: any) => file.name);
    }
  }

  onSubmit(): void {
    console.log('Anuncio publicado:', this.anuncio);
    // Aquí puedes llamar al servicio para guardar el anuncio
  }
}