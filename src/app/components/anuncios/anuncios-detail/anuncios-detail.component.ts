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
import { ArchivosService } from '../../../services/archivos.service';
import { FavoritosService } from '../../../services/favoritos.service';
import { AuthService } from '../../../services/auth.service';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-anuncios-detail',
  imports: [CommonModule],
  templateUrl: './anuncios-detail.component.html',
  styleUrls: ['./anuncios-detail.component.css']
})
export class AnunciosDetailComponent implements OnInit {
  anuncio?: Anuncio;
  criaderoData?: Criadero;
  padresImagenes: { [key: string]: string[] } = {}; 
  usuario?: { telefono: string; nombre: string };
  cachorros: Cachorro[] = [];
  imagenSeleccionada: number = 0;
  cachorroSeleccionado: number | null = null;
  imagenCachorroSeleccionada: number = 0; 
  // NUEVO: para saber si el modal es de padre/madre
  tipoModalImagen: 'cachorro' | 'padre' | 'madre' | null = null;
  imagenesModal: string[] = [];

  estiloImagenModal: { [key: string]: string } = {
    width: 'auto',
    height: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
  };
  // Para el zoom de la imagen del cachorro
  estiloImagenCachorroModal: { [key: string]: string } = {
    width: 'auto',
    height: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
  };

  precioMinimo?: string | null;
  precioMaximo?: string | null; 

  esFavorito: boolean = false;
  private idAnuncioActual: string | null = null;
  private usuarioId: string | null = null;

  mascotaDetalle: any = null; 

  constructor(
    private route: ActivatedRoute,
    private anunciosService: AnunciosService,
    private mascotasService: MascotasService,
    private usuarioService: UsuarioService,
    private criaderoService: CriaderoService,
    private cachorrosService: CachorrosService,
    private archivosService: ArchivosService,
    private favoritosService: FavoritosService,
    private authService: AuthService,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.idAnuncioActual = id;
    this.usuarioId = this.authService.getUsuarioId();
    if (id) {
      // Consultar favoritos antes de cargar el anuncio
      this.favoritosService.getFavoritosIds().subscribe(ids => {
        this.esFavorito = ids.includes(id);
      });
      this.anunciosService.getAnuncios().subscribe(async anuncios => {
        this.anuncio = anuncios.find(a => a.id === id);

        if (this.anuncio?.id_padre && this.anuncio?.id_usuario) {
          const padre = await this.mascotasService.getMascotaByIdAndUsuario(this.anuncio.id_padre, this.anuncio.id_usuario);
          if (padre?.imagenes?.length) {
            // Si las imágenes no son URLs completas, ajusta la ruta
            this.padresImagenes['padre'] = await this.archivosService.cargarImagenes(
              padre.imagenes.map((img: string) => img.startsWith('http') ? img : `mascotas/${this.anuncio?.id_padre}/${img}`)
            );
          }
          this.padreMascota = padre; 
        }

        if (this.anuncio?.id_madre && this.anuncio?.id_usuario) {
          const madre = await this.mascotasService.getMascotaByIdAndUsuario(this.anuncio.id_madre, this.anuncio.id_usuario);
          if (madre?.imagenes?.length) {
            this.padresImagenes['madre'] = await this.archivosService.cargarImagenes(
              madre.imagenes.map((img: string) => img.startsWith('http') ? img : `mascotas/${this.anuncio?.id_madre}/${img}`)
            );
          }
          this.madreMascota = madre;
        }

        if (this.anuncio?.id_usuario) {
          const usuario = await this.usuarioService.getUsuarioById(this.anuncio.id_usuario);
          if (usuario) {
            this.usuario = usuario;
          } else {
            console.warn('No se encontró el usuario asociado al anuncio.');
          }

          const id_criadero = await this.usuarioService.getIdCriaderoByUsuarioId(this.anuncio.id_usuario);
          if (id_criadero) {
            const criadero = await this.criaderoService.getCriaderoById(id_criadero);
            if (criadero) {
              this.criaderoData = criadero;

              // Cargar la foto del criadero si existe
              if (criadero.foto_perfil) {
                const ruta = `criaderos/${criadero.foto_perfil}`;
                criadero.foto_perfil = await this.archivosService.obtenerUrlImagen(ruta);
              }
            }
          } else {
            console.warn('No se encontró el id del criadero asociado al usuario.');
          }
        } else {
          console.warn('No se encontró el id del usuario asociado al anuncio.');
        }

        // Obtener el precio según especificar_cachorros
        if (this.anuncio?.especificar_cachorros) {
          // Si especificar_cachorros es true, calcula el rango de precios de los cachorros
          if (this.anuncio?.id) {
            const cachorros = await this.cachorrosService.getCachorrosByAnuncioId(this.anuncio.id);

            // Cargar las imágenes de cada cachorro
            for (const cachorro of cachorros) {
              if (cachorro.imagenes && cachorro.imagenes.length > 0) {
                // Actualizar las rutas al nuevo formato
                const imagenesConRuta = cachorro.imagenes.map((img: string) =>
                  img.startsWith('http') ? img : `cachorros/${this.anuncio?.id}/${img}`
                );
                cachorro.imagenes = await this.archivosService.cargarImagenes(imagenesConRuta);
              }
            }

            this.cachorros = cachorros;

            // Calcular el rango de precios
            const precios = this.cachorros.map(c => c.precio);
            this.precioMinimo = Math.min(...precios).toString();
            this.precioMaximo = Math.max(...precios).toString();
          }
        } else {
          // Si especificar_cachorros es false, usa directamente el precio del anuncio
          this.precioMinimo = null;
          this.precioMaximo = null;
        }
      });
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

  ajustarEstiloImagenCachorro(event: Event) {
    const imagen = event.target as HTMLImageElement;
    if (imagen.naturalWidth > imagen.naturalHeight) {
      this.estiloImagenCachorroModal = {
        width: '100%',
        height: 'auto',
        objectFit: 'contain',
      };
    } else {
      this.estiloImagenCachorroModal = {
        width: 'auto',
        height: '100%',
        objectFit: 'contain',
      };
    }
    this.prepararZoomCachorro(imagen);
  }

  prepararZoomCachorro(imagen: HTMLImageElement) {
    let scale = 1;
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

  async toggleFavorito() {
    if (!this.usuarioId || !this.idAnuncioActual) return;
    const docRef = doc(this.firestore, `favoritos/${this.usuarioId}`);
    const snapshot = await getDoc(docRef);
    if (this.esFavorito) {
      // Quitar de favoritos
      if (snapshot.exists()) {
        await updateDoc(docRef, {
          id_anuncio: arrayRemove(this.idAnuncioActual)
        });
      }
      this.esFavorito = false;
    } else {
      // Añadir a favoritos
      if (snapshot.exists()) {
        await updateDoc(docRef, {
          id_anuncio: arrayUnion(this.idAnuncioActual)
        });
      } else {
        await setDoc(docRef, { id_anuncio: [this.idAnuncioActual] });
      }
      this.esFavorito = true;
    }
  }

  abrirModalImagen(tipo: 'cachorro' | 'padre' | 'madre', idx?: number) {
    this.tipoModalImagen = tipo;
    if (tipo === 'cachorro' && idx !== undefined) {
      this.cachorroSeleccionado = idx;
      this.imagenesModal = this.cachorros[idx]?.imagenes || [];
    } else if (tipo === 'padre') {
      this.cachorroSeleccionado = null;
      this.imagenesModal = this.padresImagenes['padre'] || [];
    } else if (tipo === 'madre') {
      this.cachorroSeleccionado = null;
      this.imagenesModal = this.padresImagenes['madre'] || [];
    }
    this.imagenCachorroSeleccionada = 0;
    const modal = document.getElementById('modalCachorro');
    if (modal) {
      // @ts-ignore
      const bsModal = bootstrap.Modal.getOrCreateInstance(modal);
      bsModal.show();
    }
  }

  anteriorImagenCachorro() {
    if (this.imagenesModal.length) {
      const total = this.imagenesModal.length;
      this.imagenCachorroSeleccionada =
        (this.imagenCachorroSeleccionada - 1 + total) % total;
    }
  }

  siguienteImagenCachorro() {
    if (this.imagenesModal.length) {
      const total = this.imagenesModal.length;
      this.imagenCachorroSeleccionada =
        (this.imagenCachorroSeleccionada + 1) % total;
    }
  }

  seleccionarImagenCachorro(idx: number) {
    this.imagenCachorroSeleccionada = idx;
  }

  getPrimerNombre(): string {
    return this.usuario?.nombre?.split(' ')[0] || 'Usuario';
  }

  padreMascota?: any;
  madreMascota?: any;

  hasCachorrosDisponibles(): boolean {
    return Array.isArray(this.cachorros) && this.cachorros.some(c => c.disponible);
  }

  abrirDetallePadreMadre(tipo: 'padre' | 'madre') {
    this.mascotaDetalle = tipo === 'padre' ? this.padreMascota : this.madreMascota;
  }

  cerrarDetallesMascota() {
    this.mascotaDetalle = null;
  }

  abrirModalImagenPadreMadre() {
    if (!this.mascotaDetalle) return;
    const tipo = this.mascotaDetalle === this.padreMascota ? 'padre' : 'madre';
    this.abrirModalImagen(tipo);
    this.cerrarDetallesMascota();
  }
}
