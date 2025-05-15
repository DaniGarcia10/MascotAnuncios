import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CachorrosService } from '../../../services/cachorros.service';

@Component({
  selector: 'app-favoritos-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favoritos-resume.component.html',
  styleUrl: './favoritos-resume.component.css'
})
export class FavoritosResumeComponent implements OnInit {
  @Input() anuncio: any;
  precioMinimo: string | null = null;
  precioMaximo: string | null = null;

  constructor(private cachorrosService: CachorrosService) {}

  async ngOnInit() {
    if (this.anuncio?.especificar_cachorros) {
      if (this.anuncio?.id) {
        const cachorros = await this.cachorrosService.getCachorrosByAnuncioId(this.anuncio.id);
        const precios = cachorros.map((c: any) => c.precio);
        this.precioMinimo = precios.length ? Math.min(...precios).toString() : null;
        this.precioMaximo = precios.length ? Math.max(...precios).toString() : null;
      }
    } else {
      this.precioMinimo = this.anuncio?.precio?.toString() || null;
      this.precioMaximo = null;
    }
  }

  calcularTiempoTranscurrido(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - new Date(fecha).getTime();

    if (diferencia < 0) return 'Hace unos instantes';

    const minutos = Math.floor(diferencia / (1000 * 60));
    if (minutos < 60) return `${minutos} minutos`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas} horas`;

    const dias = Math.floor(horas / 24);
    return `${dias} días`;
  }
}
