// Angular core
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Servicios
import { CriaderoService } from '../../../services/criadero.service';
import { UsuarioService } from '../../../services/usuario.service';
import { CachorrosService } from '../../../services/cachorros.service';
import { ArchivosService } from '../../../services/archivos.service';


@Component({
  selector: 'app-anuncios-resume',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './anuncios-resume.component.html',
  styleUrls: ['./anuncios-resume.component.css']
})
export class AnunciosResumeComponent implements OnInit {
  @Input() anuncio: any;

  criaderoData: any;
  precioMinimo: string | null = null;
  precioMaximo: string | null = null;
  imagenUrlCriadero: string | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private criaderoService: CriaderoService,
    private cachorrosService: CachorrosService,
    private archivosService: ArchivosService
  ) {}

  async ngOnInit() {
    if (this.anuncio?.id_usuario) {
      const usuario = await this.usuarioService.getUsuarioById(this.anuncio.id_usuario);
      if (usuario?.id_criadero) {
        this.criaderoData = await this.criaderoService.getCriaderoById(usuario.id_criadero);

        if (this.criaderoData?.foto_perfil) {
          const ruta = `criaderos/${this.criaderoData.foto_perfil}`;
          this.imagenUrlCriadero = await this.archivosService.obtenerUrlImagen(ruta);
        }
      }
    }

    if (this.anuncio?.especificar_cachorros) {
      if (this.anuncio?.id) {
        const cachorros = await this.cachorrosService.getCachorrosByAnuncioId(this.anuncio.id);

        // Calcular el rango de precios
        const precios = cachorros.map((c: any) => c.precio);
        this.precioMinimo = Math.min(...precios).toString();
        this.precioMaximo = Math.max(...precios).toString();
      }
    } else {
      this.precioMinimo = this.anuncio.precio?.toString() || null;
      this.precioMaximo = null;
    }
  }

  calcularTiempoTranscurrido(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - new Date(fecha).getTime();

    if (diferencia < 1) return 'Hace unos instantes';

    const minutos = Math.floor(diferencia / (1000 * 60));
    if (minutos < 60) return `${minutos} minutos`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas} horas`;

    const dias = Math.floor(horas / 24);
    return `${dias} días`;
  }
}
