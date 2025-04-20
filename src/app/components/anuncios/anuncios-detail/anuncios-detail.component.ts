import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnunciosService } from '../../../services/anuncios.service';
import { Anuncio } from '../../../models/Anuncio.model';
import { CommonModule } from '@angular/common';
import { MascotasService } from '../../../services/mascotas.service';
import { CriaderoService } from '../../../services/criadero.service';
import { Criadero } from '../../../models/Criadero.model';
import { UsuarioService } from '../../../services/usuario.service';
import { CachorrosService } from '../../../services/cachorros.service'; 
import { Cachorro } from '../../../models/Cachorro.model';
import { ImagenService } from '../../../services/imagen.service';

@Component({
  selector: 'app-anuncios-detail',
  imports: [CommonModule],
  templateUrl: './anuncios-detail.component.html',
  styleUrls: ['./anuncios-detail.component.css']
})
export class AnunciosDetailComponent implements OnInit {
  anuncio?: Anuncio;
  criaderoData?: Criadero;
  padresImagenes: { [key: string]: string } = {};
  usuario?: { telefono: string; nombre: string };
  cachorros: Cachorro[] = []; // Nueva propiedad para almacenar los cachorros

  imagenSeleccionada: number = 0;
  estiloImagenModal: { [key: string]: string } = {
    width: 'auto',
    height: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
  };

  precioMinimo?: string;
  precioMaximo?: string; 

  constructor(
    private route: ActivatedRoute,
    private anunciosService: AnunciosService,
    private mascotasService: MascotasService,
    private usuarioService: UsuarioService,
    private criaderoService: CriaderoService,
    private cachorrosService: CachorrosService,
    private imagenService: ImagenService // Inyectar el servicio de imágenes
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.anunciosService.getAnuncios().subscribe(async anuncios => {
        this.anuncio = anuncios.find(a => a.id === id);

        if (this.anuncio?.imagenes && this.anuncio.imagenes.length > 0) {
          this.padresImagenes['padre'] = this.anuncio.imagenes[0];
        }

        if (this.anuncio?.id_padre) {
          const padre = await this.mascotasService.getMascotaById(this.anuncio.id_padre);
          if (padre?.imagenes?.length) {
            this.padresImagenes['padre'] = padre.imagenes[0];
          }
        }

        if (this.anuncio?.id_madre) {
          const madre = await this.mascotasService.getMascotaById(this.anuncio.id_madre);
          if (madre?.imagenes?.length) {
            this.padresImagenes['madre'] = madre.imagenes[0];
          }
        }

        if (this.anuncio?.id_usuario) {
          const usuario = await this.usuarioService.getUsuarioById(this.anuncio.id_usuario);
          if (usuario) {
            this.usuario = usuario; // Solo asigna si no es null
          } else {
            console.warn('No se encontró el usuario asociado al anuncio.');
          }

          const id_criadero = await this.usuarioService.getIdCriaderoByUsuarioId(this.anuncio.id_usuario);
          if (id_criadero) {
            const criadero = await this.criaderoService.getCriaderoById(id_criadero);
            if (criadero) {
              this.criaderoData = criadero;
            }
          } else {
            console.warn('No se encontró el id del criadero asociado al usuario.');
          }
        } else {
          console.warn('No se encontró el id del usuario asociado al anuncio.');
        }

        // Obtener los datos de los cachorros
        if (this.anuncio?.cachorros && this.anuncio.cachorros.length > 0) {
          const cachorros = await this.cachorrosService.getCachorrosByIds(this.anuncio.cachorros);

          // Cargar las imágenes de cada cachorro
          for (const cachorro of cachorros) {
            if (cachorro.imagenes && cachorro.imagenes.length > 0) {
              cachorro.imagenes = await this.imagenService.cargarImagenes(cachorro.imagenes);
            }
          }

          this.cachorros = cachorros;

          // Calcular el rango de precios
          const precios = this.cachorros.map(c => c.precio);
          this.precioMinimo = Math.min(...precios).toString();
          this.precioMaximo = Math.max(...precios).toString();
        }
      });
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

  anteriorImagen() {
    if (this.anuncio?.imagenes?.length) {
      this.imagenSeleccionada =
        (this.imagenSeleccionada - 1 + this.anuncio.imagenes.length) %
        this.anuncio.imagenes.length;
    }
  }

  siguienteImagen() {
    if (this.anuncio?.imagenes?.length) {
      this.imagenSeleccionada =
        (this.imagenSeleccionada + 1) % this.anuncio.imagenes.length;
    }
  }

  seleccionarImagen(index: number) {
    this.imagenSeleccionada = index;
  }

  ajustarEstiloImagen(event: Event) {
    const imagen = event.target as HTMLImageElement;

    if (imagen.naturalWidth > imagen.naturalHeight) {
      this.estiloImagenModal = {
        width: '100%',
        height: 'auto',
        objectFit: 'contain',
      };
    } else {
      this.estiloImagenModal = {
        width: 'auto',
        height: '100%',
        objectFit: 'contain',
      };
    }

    this.prepararZoom(imagen);
  }

  prepararZoom(imagen: HTMLImageElement) {
    let scale = 1;
    let originX = 0;
    let originY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let lastTranslateX = 0;
    let lastTranslateY = 0;

    imagen.onwheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      scale = Math.min(Math.max(1, scale + delta), 5);
      imagen.style.transform = `scale(${scale}) translate(${lastTranslateX}px, ${lastTranslateY}px)`;
    };

    imagen.onmousedown = (e: MouseEvent) => {
      if (scale <= 1) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      imagen.style.cursor = 'grabbing';
    };

    window.onmouseup = () => {
      isDragging = false;
      imagen.style.cursor = 'grab';
    };

    window.onmousemove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      lastTranslateX += dx;
      lastTranslateY += dy;
      imagen.style.transform = `scale(${scale}) translate(${lastTranslateX}px, ${lastTranslateY}px)`;
      startX = e.clientX;
      startY = e.clientY;
    };
  }

  mostrarTelefono = false;

  verTelefono() {
    this.mostrarTelefono = true;
  }

  compartirAnuncio() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.anuncio?.titulo,
        text: 'Mira este anuncio:',
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    }
  }

  denunciarAnuncio() {
    // Esto puedes sustituirlo por una lógica real con modal o llamada a API
    alert('Gracias por tu reporte. Revisaremos este anuncio.');
  }
}
