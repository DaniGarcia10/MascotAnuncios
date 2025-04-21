import { Component, OnInit } from '@angular/core';
import { Anuncio } from '../../../models/Anuncio.model';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { RazasService } from '../../../services/razas.service';
import { CommonModule } from '@angular/common';

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

  constructor(private razasService: RazasService) {}

  async ngOnInit(): Promise<void> {
    await this.razasService.getRazas(); 
    this.updateRazasList();
  }
  
  updateRazasList(): void {
    if (this.anuncio.perro === null) {
      this.filteredRazas = []; // No cargar razas si no se ha seleccionado el tipo
      return;
    }
    const tipo = this.anuncio.perro ? 'perros' : 'gatos';
    const razas = this.razasService.getRazasByTipo(tipo);
    console.log('Razas cargadas:', razas);
    this.filteredRazas = (razas || []).map(raza => ({
      label: raza,
      value: raza
    }));
  }

  onSearchRaza(event: { term: string; items: any[] }): void {
    const searchTerm = event.term;
    const tipo = this.anuncio.perro ? 'perros' : 'gatos';
    const allRazas = this.razasService.getRazasByTipo(tipo);
  
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