import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnunciosService } from '../../../services/anuncios.service';
import { Anuncio } from '../../../models/Anuncio.model';
import { CriaderoService } from '../../../services/criadero.service';
import { Criadero } from '../../../models/Criadero.model';
import { UsuarioService } from '../../../services/usuario.service';
import { CachorrosService } from '../../../services/cachorros.service';
import { MascotasService } from '../../../services/mascotas.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-anuncios-resume',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './anuncios-resume.component.html',
  styleUrls: ['./anuncios-resume.component.css']
})
export class AnunciosResumeComponent implements OnInit {
  @Input() anuncio!: Anuncio;
  anuncios: Anuncio[] = [];
  anunciosFiltrados: Anuncio[] = [];
  criaderoData?: Criadero;
  precioMinimo?: string;
  precioMaximo?: string;
  padresImagenes: { [key: string]: string } = {};

  // Filtros
  filtros = {
    ubicacion: '',
    precioMin: null as number | null,
    precioMax: null as number | null,
    tipoAnimal: '',
    raza: ''
  };

  constructor(
    private anunciosService: AnunciosService,
    private usuarioService: UsuarioService,
    private criaderoService: CriaderoService,
    private cachorrosService: CachorrosService,
    private mascotasService: MascotasService
  ) {}

  async ngOnInit() {
    this.anunciosService.getAnuncios().subscribe(data => {
      this.anuncios = data;
      this.anunciosFiltrados = [...this.anuncios]; // Inicialmente, mostrar todos los anuncios
    });

    if (this.anuncio.id_usuario) {
      this.usuarioService.getUsuarioById(this.anuncio.id_usuario).then(usuario => {
        if (usuario?.id_criadero) {
          this.criaderoService.getCriaderoById(usuario.id_criadero).then(data => {
            this.criaderoData = data;
          });
        }
      });
    }

    if (this.anuncio.cachorros && this.anuncio.cachorros.length > 0) {
      this.cachorrosService.getCachorrosByIds(this.anuncio.cachorros).then(cachorros => {
        const precios = cachorros.map(c => c.precio);
        this.precioMinimo = Math.min(...precios).toString();
        this.precioMaximo = Math.max(...precios).toString();
      });
    }

  }

  aplicarFiltros() {
    this.anunciosFiltrados = this.anuncios.filter(anuncio => {
      const cumpleUbicacion = this.filtros.ubicacion
        ? anuncio.ubicacion.toLowerCase().includes(this.filtros.ubicacion.toLowerCase())
        : true;

      const cumplePrecioMin = this.filtros.precioMin
        ? parseFloat(this.precioMinimo || '0') >= this.filtros.precioMin
        : true;

      const cumplePrecioMax = this.filtros.precioMax
        ? parseFloat(this.precioMaximo || '0') <= this.filtros.precioMax
        : true;

      const cumpleTipoAnimal = this.filtros.tipoAnimal
        ? (this.filtros.tipoAnimal === 'perro' && anuncio.perro) || 
          (this.filtros.tipoAnimal === 'gato' && !anuncio.perro)
        : true;

      const cumpleRaza = this.filtros.raza
        ? anuncio.raza.toLowerCase().includes(this.filtros.raza.toLowerCase())
        : true;

      return cumpleUbicacion && cumplePrecioMin && cumplePrecioMax && cumpleTipoAnimal && cumpleRaza;
    });
  }

  calcularTiempoTranscurrido(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - new Date(fecha).getTime();

    if (diferencia < 0) {
        return 'Hace unos instantes';
    }

    const minutos = Math.floor(diferencia / (1000 * 60));
    if (minutos < 60) {
        return `${minutos} minutos`;
    }

    const horas = Math.floor(minutos / 60);
    if (horas < 24) {
        return `${horas} horas`;
    }

    const dias = Math.floor(horas / 24);
    return `${dias} días`;
  }
}
