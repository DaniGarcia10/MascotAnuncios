import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnunciosService } from '../../../services/anuncios.service';
import { Anuncio } from '../../../models/Anuncio.model';
import { CriaderoService } from '../../../services/criadero.service';
import { Criadero } from '../../../models/Criadero.model';
import { UsuarioService } from '../../../services/usuario.service';
import { CachorrosService } from '../../../services/cachorros.service';

@Component({
  selector: 'app-anuncios-resume',
  imports: [CommonModule],
  templateUrl: './anuncios-resume.component.html',
  styleUrl: './anuncios-resume.component.css'
})
export class AnunciosResumeComponent implements OnInit {
  @Input() anuncio!: Anuncio;
  anuncios: Anuncio[] = [];
  criaderoData?: Criadero;
  precioMinimo?: string;
  precioMaximo?: string;

  constructor(
    private anunciosService: AnunciosService,
    private usuarioService: UsuarioService,
    private criaderoService: CriaderoService,
    private cachorrosService: CachorrosService
  ) {}

  ngOnInit(): void {
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
  }
}
