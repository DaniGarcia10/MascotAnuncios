import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnunciosService } from '../../../services/anuncios.service';
import { Anuncio } from '../../../models/Anuncio.model';
import { CommonModule } from '@angular/common';
import { MascotasService } from '../../../services/mascotas.service';
import { CriaderoService } from '../../../services/criadero.service';
import { UsuarioService } from '../../../services/usuario.service';
import { CachorrosService } from '../../../services/cachorros.service';
import { ArchivosService } from '../../../services/archivos.service';
import { Cachorro } from '../../../models/Cachorro.model';
import { Criadero } from '../../../models/Criadero.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { Mascota } from '../../../models/Mascota.model';
import { FormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatosService } from '../../../services/datos.service';

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

  // Nueva variable para mostrar el modal de confirmación
  mostrarConfirmacionEliminarCachorro: boolean = false;
  mostrarConfirmacionEliminarAnuncio: boolean = false;

  tipos = ['Perro', 'Gato'];
  razas: string[] = [];
  provincias: string[] = [];

  formAnuncio?: FormGroup;
  imagenSeleccionadaAnuncio: number = 0;
  imagenesOriginalesAnuncio: string[] = [];
  nuevasImagenesAnuncio: File[] = [];

  isGuardandoAnuncio: boolean = false;

  // Nueva variable para la imagen en el mini modal de cachorro
  imagenMiniModalCachorro: string = '';

  constructor(
    private route: ActivatedRoute,
    private anunciosService: AnunciosService,
    private mascotasService: MascotasService,
    private usuarioService: UsuarioService,
    private criaderoService: CriaderoService,
    private cachorrosService: CachorrosService,
    private archivosService: ArchivosService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private datosService: DatosService // <-- Inyecta el servicio
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.anunciosService.getAnuncios().subscribe(async anuncios => {
        this.anuncio = anuncios.find(a => a.id === id);

        // Asigna el tipo de mascota y las razas aquí, cuando ya tienes el anuncio
        if (this.anuncio) {
          this.tipoMascota = this.anuncio.perro;
          await this.cargarRazas(this.anuncio.perro ? 'Perro' : 'Gato');
        }

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
                criadero.foto_perfil = await this.archivosService.obtenerUrlImagen(ruta);
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
              cachorro.imagenes = await this.archivosService.cargarImagenes(imagenesConRuta);
            }
          }
          this.cachorros = cachorros;
          const precios = this.cachorros.map(c => c.precio);
          this.precioMinimo = Math.min(...precios).toString();
          this.precioMaximo = Math.max(...precios).toString();
        }
      });
    }

    // Provincias desde DatosService (opcional, si quieres también cachearlas)
    this.provincias = await this.datosService.obtenerProvincias();
  }

  // Nueva función para cargar razas usando DatosService y su caché
  async cargarRazas(tipo: 'Perro' | 'Gato') {
    const tipoKey = tipo.toLowerCase() as 'perro' | 'gato';
    this.razas = await this.datosService.obtenerRazas(tipoKey);
  }

  async cargarMascotasPadres() {
    if (!this.anuncio?.id_usuario) return;
    const mascotas = await this.mascotasService.getMascotasByUsuarioId(this.anuncio.id_usuario);

    for (const mascota of mascotas) {
      if (mascota.imagenes?.length > 0 && !mascota.imagenes[0].startsWith('http')) {
        const imagenesConRuta = mascota.imagenes.map(img => `mascotas/${this.anuncio?.id_usuario}/${img}`);
        mascota.imagenes = await this.archivosService.cargarImagenes(imagenesConRuta);
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
    if (!this.anuncio?.imagenes?.length) return;
    this.imagenSeleccionada =
      (this.imagenSeleccionada - 1 + this.anuncio.imagenes.length) % this.anuncio.imagenes.length;
  }

  siguienteImagen() {
    if (!this.anuncio?.imagenes?.length) return;
    this.imagenSeleccionada =
      (this.imagenSeleccionada + 1) % this.anuncio.imagenes.length;
  }

  seleccionarImagen(index: number) {
    this.imagenSeleccionada = index;
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

  // Al hacer click en la card principal
  editarAnuncio() {
    if (!this.anuncio) return;
    // Extrae solo nombres de imagen
    const imagenesSoloNombre = (this.anuncio.imagenes || []).map((img: string) => {
      if (!img) return '';
      if (img.startsWith('http')) {
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
    this.imagenesOriginalesAnuncio = [...imagenesSoloNombre];
    // Carga URLs públicas
    const imagenesConRuta = imagenesSoloNombre.map(nombre =>
      nombre.startsWith('http') ? nombre : `anuncios/${this.anuncio?.id}/${nombre}`
    );

    // Procesar edad para separar valor y unidad
    let edadValor = '';
    let edadUnidad = 'meses';
    if (this.anuncio.edad) {
      const match = this.anuncio.edad.match(/^(\d+)\s*(mes(?:es)?|semana(?:s)?)$/i);
      if (match) {
        edadValor = match[1];
        edadUnidad = match[2].toLowerCase().startsWith('sem') ? 'semanas' : 'meses';
      }
    }

    this.archivosService.cargarImagenes(imagenesConRuta).then(imagenesParaMostrar => {
      this.formAnuncio = this.fb.group({
        titulo: [
          this.anuncio?.titulo || '',
          [Validators.required, Validators.maxLength(70)]
        ],
        tipo: [
          this.anuncio?.perro ? 'Perro' : 'Gato',
          [Validators.required]
        ],
        raza: [
          this.anuncio?.raza || '',
          [Validators.required]
        ],
        ubicacion: [
          this.anuncio?.ubicacion || '',
          [Validators.required]
        ],
        edadValor: [
          edadValor,
          [Validators.required]
        ],
        edadUnidad: [
          edadUnidad,
          [Validators.required]
        ],
        precio: [
          this.anuncio?.precio || '',
          [Validators.required, Validators.max(100000)]
        ],
        imagenes: [
          imagenesParaMostrar,
          [Validators.required]
        ],
        descripcion: [
          this.anuncio?.descripcion || '',
          [Validators.required, Validators.maxLength(500)]
        ],
      });
      // Escuchar cambios en el tipo para actualizar razas
      this.formAnuncio.get('tipo')?.valueChanges.subscribe(async (nuevoTipo: string) => {
        await this.cargarRazas(nuevoTipo as 'Perro' | 'Gato');
        // Opcional: resetear la raza seleccionada si no pertenece al nuevo tipo
        if (!this.razas.includes(this.formAnuncio?.get('raza')?.value)) {
          this.formAnuncio?.get('raza')?.setValue('');
        }
      });
      this.imagenSeleccionadaAnuncio = 0;
      setTimeout(() => {
        const modal = document.getElementById('modalEditarAnuncio');
        if (modal) {
          // @ts-ignore
          const bsModal = new window.bootstrap.Modal(modal);
          bsModal.show();
        }
      }, 0);
    });
  }

  cerrarModalAnuncio() {
    this.formAnuncio = undefined;
    setTimeout(() => {
      const modal = document.getElementById('modalEditarAnuncio');
      if (modal) {
        // @ts-ignore
        const bsModal = window.bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      }
    }, 0);
  }

  anteriorImagenAnuncio() {
    const imagenes = this.formAnuncio?.get('imagenes')?.value || [];
    if (imagenes.length > 1) {
      this.imagenSeleccionadaAnuncio =
        (this.imagenSeleccionadaAnuncio - 1 + imagenes.length) % imagenes.length;
    }
  }
  siguienteImagenAnuncio() {
    const imagenes = this.formAnuncio?.get('imagenes')?.value || [];
    if (imagenes.length > 1) {
      this.imagenSeleccionadaAnuncio =
        (this.imagenSeleccionadaAnuncio + 1) % imagenes.length;
    }
  }
  seleccionarImagenAnuncio(index: number) {
    this.imagenSeleccionadaAnuncio = index;
  }
  eliminarImagenAnuncio(index: number) {
    const imagenes = this.formAnuncio?.get('imagenes')?.value || [];
    if (imagenes.length <= 1) return;
    imagenes.splice(index, 1);
    this.formAnuncio?.get('imagenes')?.setValue([...imagenes]);
    if (this.imagenSeleccionadaAnuncio >= imagenes.length) {
      this.imagenSeleccionadaAnuncio = Math.max(0, imagenes.length - 1);
    }
  }
  async onAnuncioFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;
    const imagenesActuales = this.formAnuncio?.get('imagenes')?.value || [];
    const nuevasImagenes: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        this.archivosService['validarExtension'](file);
        this.nuevasImagenesAnuncio.push(file);
        const url = URL.createObjectURL(file);
        nuevasImagenes.push(url);
      } catch (error: any) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        this.mostrarModalErrorExtension(
          `El formato "${extension}" no es válido. Formatos soportados: jpg, jpeg, png, webp, pdf.`
        );
        event.target.value = ''; // Limpiar input de archivos
        return; // Salir para evitar agregar imágenes inválidas
      }
    }
    this.formAnuncio?.get('imagenes')?.setValue([...imagenesActuales, ...nuevasImagenes]);
    this.formAnuncio?.get('imagenes')?.markAsTouched();
  }

  // Guardar cambios
  async guardarAnuncioEditado() {
    if (!this.formAnuncio || this.formAnuncio.invalid || !this.anuncio?.id) {
      this.formAnuncio?.markAllAsTouched(); // <-- Añade esto
      return;
    }
    this.isGuardandoAnuncio = true;
    const valores = this.formAnuncio.value;
    let imagenes = [...(valores.imagenes || [])];
    // Subir blobs in orden usando nuevasImagenesAnuncio
    let fileIndex = 0;
    for (let i = 0; i < imagenes.length; i++) {
      if (typeof imagenes[i] === 'string' && imagenes[i].startsWith('blob:')) {
        const file = this.nuevasImagenesAnuncio[fileIndex++];
        if (file) {
          const nombreArchivo = await this.archivosService.subirImagen(
            file,
            'anuncio',
            this.anuncio?.id || ''
          );
          imagenes[i] = nombreArchivo;
        }
      } else if (typeof imagenes[i] === 'string' && (imagenes[i].startsWith('http') || imagenes[i].includes('%2F'))) {
        let nombre = imagenes[i];
        if (nombre.includes('%2F')) {
          nombre = decodeURIComponent(nombre.split('%2F').pop()?.split('?')[0] || nombre);
        } else if (nombre.includes('/')) {
          nombre = decodeURIComponent(nombre.split('/').pop()?.split('?')[0] || nombre);
        }
        imagenes[i] = nombre;
      }
    }
    // Eliminar imágenes borradas
    const eliminadas = this.imagenesOriginalesAnuncio.filter(
      orig => !imagenes.includes(orig)
    ).filter(
      img => typeof img === 'string' && !img.startsWith('blob:') && !img.startsWith('http')
    );
    if (eliminadas.length && this.anuncio?.id) {
      await this.archivosService.eliminarImagenes('anuncio', this.anuncio.id, eliminadas);
    }
    this.nuevasImagenesAnuncio = [];
    // Convertir tipo a booleano antes de guardar
    const tipoBooleano = valores.tipo === 'Perro';

    // Unir edadValor y edadUnidad para guardar en el modelo
    const edad = valores.edadValor && valores.edadUnidad ? `${valores.edadValor} ${valores.edadUnidad}` : '';

    // Construir el objeto solo con los campos necesarios
    const dataToUpdate = {
      titulo: valores.titulo,
      raza: valores.raza,
      ubicacion: valores.ubicacion,
      edad,
      precio: valores.precio,
      descripcion: valores.descripcion,
      perro: valores.tipo === 'Perro',
      imagenes
    };

    // Actualizar en Firebase
    await this.anunciosService.actualizarAnuncio(this.anuncio.id, dataToUpdate);
    // Recargar URLs públicas
    const imagenesConRuta = imagenes.map(nombre =>
      nombre.startsWith('http') ? nombre : `anuncios/${this.anuncio?.id}/${nombre}`
    );
    this.anuncio = {
      ...this.anuncio,
      ...valores,
      edad,
      perro: tipoBooleano,
      imagenes: await this.archivosService.cargarImagenes(imagenesConRuta)
    };
    this.isGuardandoAnuncio = false;
    this.cerrarModalAnuncio();
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
    const imagenesParaMostrar = await this.archivosService.cargarImagenes(imagenesConRuta);

    this.formCachorro = this.fb.group({
      color: [this.cachorroEditando.color, []],
      sexo: [this.cachorroEditando.sexo, [Validators.required]],
      precio: [
        this.cachorroEditando.precio,
        [Validators.required, Validators.max(100000)]
      ],
      disponible: [this.cachorroEditando.disponible],
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
    if (!this.formCachorro || this.formCachorro.invalid) {
      this.formCachorro?.markAllAsTouched(); // <-- Añade esto
      return;
    }
    const valores = this.formCachorro.value;
    let imagenes = [...(valores.imagenes || [])];

    const indexEditando = this.indexCachorroEditando;

    this.isGuardandoCachorro = true;
    // Quitar cerrarModalCachorro() de aquí

    // Subir blobs
    let fileIndex = 0;
    for (let i = 0; i < imagenes.length; i++) {
      if (typeof imagenes[i] === 'string' && imagenes[i].startsWith('blob:')) {
        const file = this.nuevasImagenesCachorro[fileIndex++];
        if (file) {
          const nombreArchivo = await this.archivosService.subirImagen(
            file,
            'cachorro',
            this.anuncio?.id || ''
          );
          imagenes[i] = nombreArchivo;
        }
      } else if (typeof imagenes[i] === 'string' && (imagenes[i].startsWith('http') || imagenes[i].includes('%2F'))) {
        let nombre = imagenes[i];
        if (nombre.includes('%2F')) {
          nombre = decodeURIComponent(nombre.split('%2F').pop()?.split('?')[0] || nombre);
        } else if (nombre.includes('/')) {
          nombre = decodeURIComponent(nombre.split('/').pop()?.split('?')[0] || nombre);
        }
        imagenes[i] = nombre;
      }
    }
    this.nuevasImagenesCachorro = [];

    if (indexEditando === -1) {
      // CREAR NUEVO CACHORRO
      if (!this.anuncio?.id) {
        this.isGuardandoCachorro = false;
        return;
      }
      const nuevoCachorro = {
        ...valores,
        imagenes: imagenes,
        id_anuncio: this.anuncio.id,
      };
      const idNuevo = await this.cachorrosService.crearCachorro(nuevoCachorro);
      const imagenesConRuta = imagenes.map(nombre =>
        nombre.startsWith('http') ? nombre : `cachorros/${this.anuncio?.id}/${nombre}`
      );
      const urls = await this.archivosService.cargarImagenes(imagenesConRuta);
      const cachorroCreado = {
        ...nuevoCachorro,
        id: idNuevo,
        imagenes: urls,
      };
      this.cachorros.push(cachorroCreado);
      // Asigna el cachorro creado para futuras ediciones inmediatas
      this.cachorroEditando = cachorroCreado;

      // --- NUEVO: Si es el primer cachorro, poner especificar_cachorros a true ---
      if (this.cachorros.length === 1 && this.anuncio && !this.anuncio.especificar_cachorros) {
        this.anuncio.especificar_cachorros = true;
        await this.anunciosService.actualizarAnuncio(this.anuncio.id, { especificar_cachorros: true });
      }
    } else {
      // EDICIÓN DE CACHORRO EXISTENTE
      const eliminadas = this.imagenesOriginalesCachorro.filter(
        orig => !imagenes.includes(orig)
      ).filter(
        img => typeof img === 'string' && !img.startsWith('blob:') && !img.startsWith('http')
      );
      if (eliminadas.length && this.anuncio?.id) {
        await this.archivosService.eliminarImagenes('cachorro', this.anuncio.id, eliminadas);
      }

      // Obtener el id de forma robusta
      let id = this.cachorroEditando?.id;
      if (!id && this.cachorros[indexEditando]) {
        id = this.cachorros[indexEditando].id;
      }
      if (!id) {
        console.error('Error: El cachorro no tiene ID');
        this.isGuardandoCachorro = false;
        return;
      }

      const datosActualizados = {
        color: valores.color,
        sexo: valores.sexo,
        precio: valores.precio,
        disponible: valores.disponible,
        descripcion: valores.descripcion,
        imagenes
      };

      await this.cachorrosService.actualizarCachorro(id, datosActualizados);

      if (this.anuncio?.id) {
        const imagenesConRuta = imagenes.map(nombre =>
          nombre.startsWith('http') ? nombre : `cachorros/${this.anuncio?.id}/${nombre}`
        );
        const urls = await this.archivosService.cargarImagenes(imagenesConRuta);
        this.cachorros[indexEditando] = {
          ...this.cachorros[indexEditando],
          ...valores,
          imagenes: urls
        };
      }
    }

    this.isGuardandoCachorro = false;
    this.cerrarModalCachorro(); // Ahora se cierra aquí, después de guardar
  }



  async onCachorroFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;
    const imagenesActuales = this.formCachorro?.get('imagenes')?.value || [];
    const nuevasImagenes: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Validar extensión usando el servicio
        this.archivosService['validarExtension'](file);
        this.nuevasImagenesCachorro.push(file);
        // Solo para previsualización, no subir aún
        const url = URL.createObjectURL(file);
        nuevasImagenes.push(url);
      } catch (error: any) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        this.mostrarModalErrorExtension(
          `El formato "${extension}" no es válido. Formatos soportados: jpg, jpeg, png, webp, pdf.`
        );
        event.target.value = ''; // Limpiar input de archivos
        return; // Salir para evitar agregar imágenes inválidas
      }
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

  abrirModalNuevoCachorro() {
    this.cachorroEditando = undefined;
    this.indexCachorroEditando = -1;
    this.imagenesOriginalesCachorro = [];
    this.nuevasImagenesCachorro = [];
    this.formCachorro = this.fb.group({
      color: ['', []],
      sexo: ['', [Validators.required]],
      precio: ['', [Validators.required, Validators.max(100000)]],
      disponible: [true],
      imagenes: [[], [
        Validators.required,
        (control: AbstractControl) => (control.value && control.value.length > 0 ? null : { required: true })
      ]],
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

  eliminarCachorroModal() {
    if (!this.cachorroEditando?.id || !this.anuncio?.id) return;
    // Abre el modal de confirmación
    this.mostrarConfirmacionEliminarCachorro = true;
    setTimeout(() => {
      const modal = document.getElementById('modalConfirmarEliminarCachorro');
      if (modal) {
        // @ts-ignore
        const bsModal = new window.bootstrap.Modal(modal);
        bsModal.show();
      }
    }, 0);
  }

  // Llama a esto si el usuario confirma la eliminación
  async confirmarEliminarCachorro() {
    if (!this.cachorroEditando?.id || !this.anuncio?.id) return;
    this.isGuardandoCachorro = true;

    await this.cachorrosService.eliminarCachorro(this.cachorroEditando!.id);

    // Eliminar todas las imágenes del cachorro en Firebase Storage
    if (this.cachorroEditando?.imagenes && this.cachorroEditando.imagenes.length > 0) {
      const idAnuncio = this.anuncio.id;
      // Extraer solo el nombre de archivo de cada imagen
      const nombresImagenes = this.cachorroEditando.imagenes.map((img: string) => {
        if (!img) return '';
        if (img.startsWith('http')) {
          if (img.includes('%2F')) {
            const nombreCodificado = img.split('%2F').pop()?.split('?')[0] || img;
            return decodeURIComponent(nombreCodificado);
          }
          if (img.includes('/')) {
            return decodeURIComponent(img.split('/').pop()?.split('?')[0] || img);
          }
        }
        return img;
      }).filter(Boolean);

      if (nombresImagenes.length > 0) {
        await this.archivosService.eliminarImagenes('cachorro', idAnuncio, nombresImagenes);
        console.log(`Imágenes eliminadas de Firebase Storage:`, nombresImagenes);
      }
    }

    this.cachorros = this.cachorros.filter(c => c.id !== this.cachorroEditando?.id);

    // --- NUEVO: Si no quedan cachorros, poner especificar_cachorros a false ---
    if (this.cachorros.length === 0 && this.anuncio && this.anuncio.especificar_cachorros) {
      this.anuncio.especificar_cachorros = false;
      await this.anunciosService.actualizarAnuncio(this.anuncio.id, { especificar_cachorros: false });
    }

    this.isGuardandoCachorro = false;
    this.cerrarModalCachorro();
    this.cerrarModalConfirmacionEliminarCachorro();
    this.snackBar.open('Cachorro eliminado correctamente', 'X', { 
      duration: 2500, 
      panelClass: 'snackbar-success',
      verticalPosition: 'top'
    });
  }

  cerrarModalConfirmacionEliminarCachorro() {
    this.mostrarConfirmacionEliminarCachorro = false;
    setTimeout(() => {
      const modal = document.getElementById('modalConfirmarEliminarCachorro');
      if (modal) {
        // @ts-ignore
        const bsModal = window.bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      }
    }, 0);
  }

  eliminarAnuncioModal() {
    this.mostrarConfirmacionEliminarAnuncio = true;
    setTimeout(() => {
      const modal = document.getElementById('modalConfirmarEliminarAnuncio');
      if (modal) {
        // @ts-ignore
        const bsModal = new window.bootstrap.Modal(modal);
        bsModal.show();
      }
    }, 0);
  }

  async confirmarEliminarAnuncio() {
    if (!this.anuncio?.id) return;
    await this.anunciosService.eliminarAnuncio(this.anuncio.id).toPromise();
    // Redirige o recarga la página, o muestra un mensaje
    window.location.href = '/mis-anuncios'; // Cambia la ruta según tu app
  }

  cerrarModalConfirmacionEliminarAnuncio() {
    this.mostrarConfirmacionEliminarAnuncio = false;
    setTimeout(() => {
      const modal = document.getElementById('modalConfirmarEliminarAnuncio');
      if (modal) {
        // @ts-ignore
        const bsModal = window.bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      }
    }, 0);
  }

  mostrarModalErrorExtension(mensaje: string) {
    setTimeout(() => {
      const mensajeDiv = document.getElementById('mensajeErrorExtensionImagen');
      if (mensajeDiv) mensajeDiv.textContent = mensaje;
      const modal = document.getElementById('modalErrorExtensionImagen');
      if (modal) {
        // @ts-ignore
        const bsModal = new window.bootstrap.Modal(modal);
        bsModal.show();
      }
    }, 0);
  }

  // Abre el mini modal de disponibilidad
  async abrirMiniModalDisponibilidadCachorro(id: string, index: number) {
    // Prepara el formCachorro solo con el campo disponible
    const cachorro = this.cachorros[index];
    this.cachorroEditando = { ...cachorro };
    this.indexCachorroEditando = index;
    this.formCachorro = this.fb.group({
      disponible: [cachorro.disponible]
    });
    // Asigna la imagen principal (la primera)
    this.imagenMiniModalCachorro = cachorro.imagenes?.[0] || '';
    setTimeout(() => {
      const modal = document.getElementById('modalDisponibilidadCachorro');
      if (modal) {
        // @ts-ignore
        const bsModal = new window.bootstrap.Modal(modal);
        bsModal.show();
      }
    }, 0);
  }

  // Desde el mini modal, abre el modal de edición completo
  abrirModalEditarCachorroDesdeMiniModal() {
    // Cierra el mini modal
    setTimeout(() => {
      const modal = document.getElementById('modalDisponibilidadCachorro');
      if (modal) {
        // @ts-ignore
        const bsModal = window.bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      }
    }, 0);
    // Abre el modal de edición completo
    if (this.cachorroEditando?.id) {
      this.editarCachorro(this.cachorroEditando.id);
    }
  }
}
