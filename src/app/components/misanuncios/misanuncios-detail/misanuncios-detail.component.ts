import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnunciosService } from '../../../services/anuncios.service';
import { Anuncio } from '../../../models/Anuncio.model';
import { CommonModule } from '@angular/common';
import { MascotasService } from '../../../services/mascotas.service';
import { CriaderoService } from '../../../services/criadero.service';
import { UsuarioService } from '../../../services/usuario.service';
import { CachorrosService } from '../../../services/cachorros.service';
import { ImagenService } from '../../../services/imagen.service';
import { Cachorro } from '../../../models/Cachorro.model';
import { Criadero } from '../../../models/Criadero.model';

@Component({
  selector: 'app-misanuncios-detail',
  imports: [CommonModule],
  templateUrl: './misanuncios-detail.component.html',
  styleUrls: ['./misanuncios-detail.component.css']
})
export class MisanunciosDetailComponent implements OnInit {
  anuncio?: Anuncio;
  criaderoData?: Criadero | null;
  padresImagenes: { [key: string]: string } = {};
  cachorros: Cachorro[] = [];
  imagenSeleccionada: number = 0;
  precioMinimo?: string;
  precioMaximo?: string;
  usuario?: { nombre: string; telefono: string }; // Nueva propiedad
  estiloImagenModal: { [key: string]: string } = {
    width: 'auto',
    height: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
  }; // Nueva propiedad

  constructor(
    private route: ActivatedRoute,
    private anunciosService: AnunciosService,
    private mascotasService: MascotasService,
    private usuarioService: UsuarioService,
    private criaderoService: CriaderoService,
    private cachorrosService: CachorrosService,
    private imagenService: ImagenService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.anunciosService.getAnuncios().subscribe(async anuncios => {
        this.anuncio = anuncios.find(a => a.id === id);

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
            this.usuario = { nombre: usuario.nombre, telefono: usuario.telefono }; // Asignar datos del usuario
            this.criaderoData = await this.criaderoService.getCriaderoById(usuario.id_criadero);
          }

          const id_criadero = await this.usuarioService.getIdCriaderoByUsuarioId(this.anuncio.id_usuario);
          if (id_criadero) {
            const criadero = await this.criaderoService.getCriaderoById(id_criadero);
            if (criadero) {
              this.criaderoData = criadero;

              if (criadero.foto_perfil) {
                const ruta = `criaderos/${criadero.foto_perfil}`;
                criadero.foto_perfil = await this.imagenService.obtenerUrlImagen(ruta);
              }
            }
          }
        }

        if (this.anuncio?.especificar_cachorros) {
          if (this.anuncio?.id) {
            const cachorros = await this.cachorrosService.getCachorrosByAnuncioId(this.anuncio.id);

            for (const cachorro of cachorros) {
              if (cachorro.imagenes && cachorro.imagenes.length > 0) {
                const imagenesConRuta = cachorro.imagenes.map((img: string) =>
                  img.startsWith('http') ? img : `cachorros/${this.anuncio?.id}/${img}`
                );
                cachorro.imagenes = await this.imagenService.cargarImagenes(imagenesConRuta);
              }
            }

            this.cachorros = cachorros;

            const precios = this.cachorros.map(c => c.precio);
            this.precioMinimo = Math.min(...precios).toString();
            this.precioMaximo = Math.max(...precios).toString();
          }
        }
      });
    }
  }

  //Compartir anuncio
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

  eliminarCachorro(id: string) {
    this.cachorros = this.cachorros.filter(c => c.id !== id);
    // Aquí puedes llamar a un servicio para eliminar el cachorro en la base de datos
  }

  eliminarPadre(tipo: 'padre' | 'madre') {
    if (tipo === 'padre') this.anuncio!.id_padre = '';
    if (tipo === 'madre') this.anuncio!.id_madre = '';
    delete this.padresImagenes[tipo];
    // Aquí puedes llamar a un servicio para actualizar el anuncio en la base de datos
  }

  eliminarImagen(index: number) {
    this.anuncio!.imagenes.splice(index, 1);
    // Aquí puedes llamar a un servicio para actualizar las imágenes en la base de datos
  }

  agregarImagen(imagen: string) {
    this.anuncio!.imagenes.push(imagen);
    // Aquí puedes llamar a un servicio para guardar la nueva imagen en la base de datos
  }

  anteriorImagen() {
    if (this.anuncio?.imagenes?.length) {
      this.imagenSeleccionada =
        (this.imagenSeleccionada - 1 + this.anuncio.imagenes.length) % this.anuncio.imagenes.length;
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

  editarAnuncio() {
    console.log('Editar anuncio:', this.anuncio);
    // Lógica para editar el anuncio
  }

  editarPadres(tipo: 'padre' | 'madre') {
    console.log('Editar', tipo, 'del anuncio:', this.anuncio);
    // Lógica para editar el padre o la madre
  }

  editarCachorro(id: string) {
    console.log('Editar cachorro con ID:', id);
    // Lógica para editar el cachorro
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

  // Métodos adicionales para manejar la edición
  
}