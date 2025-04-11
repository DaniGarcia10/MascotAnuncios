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

@Component({
  selector: 'app-anuncios-resume',
  imports: [CommonModule, RouterModule],
  templateUrl: './anuncios-resume.component.html',
  styleUrls: ['./anuncios-resume.component.css']
})
export class AnunciosResumeComponent implements OnInit {
  @Input() anuncio!: Anuncio;
  anuncios: Anuncio[] = [];
  criaderoData?: Criadero;
  precioMinimo?: string;
  precioMaximo?: string;
  padresImagenes: { [key: string]: string } = {};

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

    // Obtener imágenes de los padres
    if (this.anuncio.id_padre) {
      const padre = await this.mascotasService.getMascotaById(this.anuncio.id_padre);
      if (padre?.imagenes?.length) {
        this.padresImagenes['padre'] = padre.imagenes[0]; // Usar la primera imagen
      }
    }

    if (this.anuncio.id_madre) {
      const madre = await this.mascotasService.getMascotaById(this.anuncio.id_madre);
      if (madre?.imagenes?.length) {
        this.padresImagenes['madre'] = madre.imagenes[0]; // Usar la primera imagen
      }
    }
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
