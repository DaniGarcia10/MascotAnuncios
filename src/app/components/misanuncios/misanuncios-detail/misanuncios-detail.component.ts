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
import { NgSelectModule } from '@ng-select/ng-select';
import { Mascota } from '../../../models/Mascota.model';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-misanuncios-detail',
  imports: [CommonModule, NgSelectModule, FormsModule, ReactiveFormsModule],
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
  usuario?: { nombre: string; telefono: string };
  estiloImagenModal: { [key: string]: string } = {
    width: 'auto',
    height: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
  };
  machos: Mascota[] = [];
  hembras: Mascota[] = [];
  tipoMascota: boolean | null = null;

  // Nuevas variables auxiliares para la selección temporal de padres
  nuevoPadreId: string | null = null;
  nuevaMadreId: string | null = null;

  // Variables para el modal de edición de cachorro
  modalCachorroAbierto: boolean = false;
  cachorroEditando?: Cachorro;
  formCachorro?: FormGroup;
  indexCachorroEditando: number = -1;
  imagenSeleccionadaCachorro: number = 0;
  isGuardandoCachorro: boolean = false;

  // Añade una variable para almacenar los archivos seleccionados
  nuevasImagenesCachorro: File[] = [];
  imagenesOriginalesCachorro: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private anunciosService: AnunciosService,
    private mascotasService: MascotasService,
    private usuarioService: UsuarioService,
    private criaderoService: CriaderoService,
    private cachorrosService: CachorrosService,
    private imagenService: ImagenService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.anunciosService.getAnuncios().subscribe(async anuncios => {
        this.anuncio = anuncios.find(a => a.id === id);

        await this.actualizarImagenesPadres();

        if (this.anuncio?.id_usuario) {
          const usuario = await this.usuarioService.getUsuarioById(this.anuncio.id_usuario);
          if (usuario) {
            this.usuario = { nombre: usuario.nombre, telefono: usuario.telefono };
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

          this.tipoMascota = this.anuncio.perro;
          this.cargarMascotasPadres();
        }

        if (this.anuncio?.especificar_cachorros && this.anuncio?.id) {
          const cachorros = await this.cachorrosService.getCachorrosByAnuncioId(this.anuncio.id);
          for (const cachorro of cachorros) {
            if (cachorro.imagenes?.length > 0) {
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
      });
    }
  }

  async cargarMascotasPadres() {
    if (!this.anuncio?.id_usuario) return;
    const mascotas = await this.mascotasService.getMascotasByUsuarioId(this.anuncio.id_usuario);

    for (const mascota of mascotas) {
      if (mascota.imagenes?.length > 0 && !mascota.imagenes[0].startsWith('http')) {
        const imagenesConRuta = mascota.imagenes.map(img => `mascotas/${this.anuncio?.id_usuario}/${img}`);
        mascota.imagenes = await this.imagenService.cargarImagenes(imagenesConRuta);
      }
    }

    const tipo = this.tipoMascota;
    this.machos = mascotas.filter(m => m.perro === tipo && m.sexo?.toLowerCase() === 'macho');
    this.hembras = mascotas.filter(m => m.perro === tipo && m.sexo?.toLowerCase() === 'hembra');
  }

  abrirModalPadres(tipo: 'padre' | 'madre') {
    this.cargarMascotasPadres();
    // Al abrir el modal, cargar los valores actuales de los padres en los desplegables
    this.nuevoPadreId = this.anuncio?.id_padre || null;
    this.nuevaMadreId = this.anuncio?.id_madre || null;
    setTimeout(() => {
      const modal = document.getElementById('modalPadres');
      if (modal) {
        // @ts-ignore
        const bsModal = new window.bootstrap.Modal(modal);
        bsModal.show();
      }
    }, 0);
  }

  async guardarPadres(tipo?: 'padre' | 'madre', idMascotaSeleccionada?: string) {
    if (!this.anuncio) return;

    // Si se deja en blanco, eliminar el padre/madre
    let padreId = this.nuevoPadreId?.trim() || '';
    let madreId = this.nuevaMadreId?.trim() || '';

    // Si se pasa tipo e idMascotaSeleccionada, actualizar solo ese campo
    if (tipo === 'padre') padreId = idMascotaSeleccionada || '';
    if (tipo === 'madre') madreId = idMascotaSeleccionada || '';

    try {
      await this.anunciosService.actualizarPadres(this.anuncio.id, padreId, madreId);

      // Recargar datos desde Firebase después del guardado
      this.anuncio.id_padre = padreId;
      this.anuncio.id_madre = madreId;
      await this.actualizarImagenesPadres();
    } catch (e) {
      console.error('Error guardando padres en Firebase', e);
    }
  }

  async actualizarImagenesPadres() {
    if (this.anuncio?.id_padre) {
      const padre = await this.mascotasService.getMascotaById(this.anuncio.id_padre);
      this.padresImagenes['padre'] = padre?.imagenes?.[0] || '';
    } else {
      this.padresImagenes['padre'] = '';
    }

    if (this.anuncio?.id_madre) {
      const madre = await this.mascotasService.getMascotaById(this.anuncio.id_madre);
      this.padresImagenes['madre'] = madre?.imagenes?.[0] || '';
    } else {
      this.padresImagenes['madre'] = '';
    }
  }

  eliminarCachorro(id: string) {
    this.cachorros = this.cachorros.filter(c => c.id !== id);
  }

  eliminarPadre(tipo: 'padre' | 'madre') {
    if (!this.anuncio) return;
    if (tipo === 'padre') this.anuncio.id_padre = '';
    if (tipo === 'madre') this.anuncio.id_madre = '';
    delete this.padresImagenes[tipo];
  }

  eliminarImagen(index: number) {
    this.anuncio?.imagenes.splice(index, 1);
  }

  agregarImagen(imagen: string) {
    this.anuncio?.imagenes.push(imagen);
  }

  // Flechas para navegar entre imágenes del cachorro
  anteriorImagenCachorro() {
    const imagenes = this.formCachorro?.get('imagenes')?.value || [];
    if (imagenes.length > 1) {
      this.imagenSeleccionadaCachorro =
        (this.imagenSeleccionadaCachorro - 1 + imagenes.length) % imagenes.length;
    }
  }

  siguienteImagenCachorro() {
    const imagenes = this.formCachorro?.get('imagenes')?.value || [];
    if (imagenes.length > 1) {
      this.imagenSeleccionadaCachorro =
        (this.imagenSeleccionadaCachorro + 1) % imagenes.length;
    }
  }

  seleccionarImagenCachorro(index: number) {
    this.imagenSeleccionadaCachorro = index;
  }

  async eliminarImagenCachorro(index: number) {
    const imagenes = this.formCachorro?.get('imagenes')?.value || [];
    if (imagenes.length <= 1) return; // No permitir borrar la última

    // Solo elimina del array, NO del storage aquí
    imagenes.splice(index, 1);
    this.formCachorro?.get('imagenes')?.setValue([...imagenes]);
    // Ajustar imagenSeleccionadaCachorro si es necesario
    if (this.imagenSeleccionadaCachorro >= imagenes.length) {
      this.imagenSeleccionadaCachorro = Math.max(0, imagenes.length - 1);
    }
  }

  anteriorImagen() {
    const imagenes = this.formCachorro?.get('imagenes')?.value || [];
    if (imagenes.length > 1) {
      this.imagenSeleccionada =
        (this.imagenSeleccionada - 1 + imagenes.length) % imagenes.length;
    }
  }

  siguienteImagen() {
    const imagenes = this.formCachorro?.get('imagenes')?.value || [];
    if (imagenes.length > 1) {
      this.imagenSeleccionada =
        (this.imagenSeleccionada + 1) % imagenes.length;
    }
  }

  seleccionarImagen(index: number) {
    this.imagenSeleccionada = index;
  }

  editarAnuncio() {
    console.log('Editar anuncio:', this.anuncio);
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

  async editarCachorro(id: string) {
    // Busca el cachorro por id
    const index = this.cachorros.findIndex(c => c.id === id);
    if (index === -1) return;
    this.cachorroEditando = { ...this.cachorros[index] };
    this.indexCachorroEditando = index;

    // Convertir nombres de imagen a URLs públicas para el modal
    let imagenesSoloNombre = (this.cachorroEditando.imagenes || []).map((img: string) => {
      if (!img) return '';
      if (img.startsWith('http')) {
        // Extraer solo el nombre del archivo de la URL de Firebase
        if (img.includes('%2F')) {
          const nombreCodificado = img.split('%2F').pop()?.split('?')[0] || img;
          return decodeURIComponent(nombreCodificado);
        }
        if (img.includes('/')) {
          return decodeURIComponent(img.split('/').pop()?.split('?')[0] || img);
        }
      }
      return img;
    });

    // Guarda las imágenes originales para poder comparar al guardar
    this.imagenesOriginalesCachorro = [...imagenesSoloNombre];

    // Obtener URLs públicas para mostrar en el modal
    const imagenesConRuta = imagenesSoloNombre.map(nombre =>
      nombre.startsWith('http') ? nombre : `cachorros/${this.anuncio?.id}/${nombre}`
    );
    const imagenesParaMostrar = await this.imagenService.cargarImagenes(imagenesConRuta);

    this.formCachorro = this.fb.group({
      color: [this.cachorroEditando.color, []],
      sexo: [this.cachorroEditando.sexo, [Validators.required]],
      precio: [this.cachorroEditando.precio, [Validators.required]],
      disponible: [this.cachorroEditando.disponible],
      descripcion: [this.cachorroEditando.descripcion],
      imagenes: [imagenesParaMostrar, [Validators.required]],
    });
    this.imagenSeleccionadaCachorro = 0;
    this.modalCachorroAbierto = true;
    setTimeout(() => {
      const modal = document.getElementById('modalEditarCachorro');
      if (modal) {
        // @ts-ignore
        const bsModal = new window.bootstrap.Modal(modal);
        bsModal.show();
      }
    }, 0);
  }

  cerrarModalCachorro() {
    this.modalCachorroAbierto = false;
    this.cachorroEditando = undefined;
    this.indexCachorroEditando = -1;
    this.formCachorro = undefined;
    // Cierra el modal de Bootstrap si está abierto
    setTimeout(() => {
      const modal = document.getElementById('modalEditarCachorro');
      if (modal) {
        // @ts-ignore
        const bsModal = window.bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      }
    }, 0);
  }

  async guardarCachorroEditado() {
    if (!this.formCachorro || this.formCachorro.invalid || this.indexCachorroEditando === -1) return;
    this.isGuardandoCachorro = true;
    const valores = this.formCachorro.value;
    let imagenes = [...(valores.imagenes || [])];

    // Subir blobs en orden usando nuevasImagenesCachorro
    let fileIndex = 0;
    for (let i = 0; i < imagenes.length; i++) {
      if (typeof imagenes[i] === 'string' && imagenes[i].startsWith('blob:')) {
        const file = this.nuevasImagenesCachorro[fileIndex++];
        if (file) {
          const nombreArchivo = await this.imagenService.subirImagen(
            file,
            'cachorro',
            this.anuncio?.id || ''
          );
          imagenes[i] = nombreArchivo;
        }
      } else if (typeof imagenes[i] === 'string' && (imagenes[i].startsWith('http') || imagenes[i].includes('%2F'))) {
        // Si es una URL pública, extrae solo el nombre del archivo
        let nombre = imagenes[i];
        if (nombre.includes('%2F')) {
          nombre = decodeURIComponent(nombre.split('%2F').pop()?.split('?')[0] || nombre);
        } else if (nombre.includes('/')) {
          nombre = decodeURIComponent(nombre.split('/').pop()?.split('?')[0] || nombre);
        }
        imagenes[i] = nombre;
      }
      // Si ya es solo el nombre, no hace falta hacer nada
    }
    this.nuevasImagenesCachorro = [];

    // Eliminar del storage solo imágenes reales (no blobs ni URLs)
    const eliminadas = this.imagenesOriginalesCachorro.filter(
      orig => !imagenes.includes(orig)
    ).filter(
      img => typeof img === 'string' && !img.startsWith('blob:') && !img.startsWith('http')
    );
    if (eliminadas.length && this.anuncio?.id) {
      await this.imagenService.eliminarImagenes('cachorro', this.anuncio.id, eliminadas);
    }

    // Guardar solo los nombres en Firebase
    this.cachorros[this.indexCachorroEditando] = {
      ...this.cachorros[this.indexCachorroEditando],
      ...valores,
      imagenes: imagenes
    };
    if (this.cachorroEditando?.id) {
      const { id, ...resto } = this.cachorros[this.indexCachorroEditando];
      await this.cachorrosService.actualizarCachorro(id, resto);
    }

    // Recargar las URLs públicas para mostrar en la app
    if (this.anuncio?.id) {
      const imagenesConRuta = imagenes.map(nombre =>
        nombre.startsWith('http') ? nombre : `cachorros/${this.anuncio?.id}/${nombre}`
      );
      this.cachorros[this.indexCachorroEditando].imagenes = await this.imagenService.cargarImagenes(imagenesConRuta);
    }

    this.isGuardandoCachorro = false;
    this.cerrarModalCachorro();
  }

  async onCachorroFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;
    const imagenesActuales = this.formCachorro?.get('imagenes')?.value || [];
    const nuevasImagenes: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.nuevasImagenesCachorro.push(file);
      // Solo para previsualización, no subir aún
      const url = URL.createObjectURL(file);
      nuevasImagenes.push(url);
    }

    this.formCachorro?.get('imagenes')?.setValue([...imagenesActuales, ...nuevasImagenes]);
    this.formCachorro?.get('imagenes')?.markAsTouched();
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

  async cambiarDisponibilidadCachorro() {
    if (!this.formCachorro) return;
    const actual = this.formCachorro.get('disponible')?.value;
    const nuevo = !actual;
    this.formCachorro.get('disponible')?.setValue(nuevo);
    if (this.indexCachorroEditando !== -1) {
      this.cachorros[this.indexCachorroEditando].disponible = nuevo;
    }
    if (this.cachorroEditando?.id) {
      await this.cachorrosService.actualizarDisponibilidad(this.cachorroEditando.id, nuevo);
    }
  }
}
