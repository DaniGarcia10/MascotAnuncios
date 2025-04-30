import { Component, Input, OnInit } from '@angular/core';
import { CriaderoService } from '../../../services/criadero.service';
import { UsuarioService } from '../../../services/usuario.service';
import { CachorrosService } from '../../../services/cachorros.service';
import { ImagenService } from '../../../services/imagen.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
    private imagenService: ImagenService
  ) {}

  async ngOnInit() {
    if (this.anuncio?.id_usuario) {
      const usuario = await this.usuarioService.getUsuarioById(this.anuncio.id_usuario);
      if (usuario?.id_criadero) {
        this.criaderoData = await this.criaderoService.getCriaderoById(usuario.id_criadero);

        if (this.criaderoData?.foto_perfil) {
          const ruta = `criaderos/${this.criaderoData.foto_perfil}`;
          this.imagenUrlCriadero = await this.imagenService.obtenerUrlImagen(ruta);
        }
      }
    }

    if (this.anuncio?.especificar_cachorros) {
      if (this.anuncio?.cachorros?.length > 0) {
        const cachorros = await this.cachorrosService.getCachorrosByIds(this.anuncio.cachorros);
        const precios = cachorros.map((c: any) => c.precio);
        this.precioMinimo = Math.min(...precios).toString();
        this.precioMaximo = Math.max(...precios).toString();
      }
    } else {
      this.precioMinimo = this.anuncio.precio?.toString() || null;
      this.precioMaximo = null;
    }
  }

  calcularTiempoTranscurrido(fechaPublicacion: string): string {
    const fecha = new Date(fechaPublicacion);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHoras < 24) return `${diffHoras} horas`;
    const diffDias = Math.floor(diffHoras / 24);
    return `${diffDias} días`;
  }
}
