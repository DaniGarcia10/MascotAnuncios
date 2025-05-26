import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchivosService } from '../../../services/archivos.service';
import { SafeUrlPipe } from '../../../pipes/safe-url.pipe';
import { Usuario } from '../../../models/Usuario.model';
import { Documentacion, Estado } from '../../../models/documentacion.model';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocumentacionResumeComponent } from '../documentacion-resume/documentacion-resume.component';
import { DocumentacionService } from '../../../services/documentacion.service';
import { CriaderoService } from '../../../services/criadero.service'; 

@Component({
  selector: 'app-documentacion-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    SafeUrlPipe,
    DocumentacionResumeComponent,
  ],
  templateUrl: './documentacion-list.component.html',
  styleUrls: ['./documentacion-list.component.css']
})
export class DocumentacionListComponent implements OnInit {
  Estado = Estado; 
  usuarios: { 
    usuario: Usuario, 
    archivos: { nombre: string, url: string }[], 
    documentacion?: Documentacion,
    criadero?: any
  }[] = [];
  usuariosFiltrados: { 
    usuario: Usuario, 
    archivos: { nombre: string, url: string }[], 
    documentacion?: Documentacion,
    criadero?: any
  }[] = [];
  loading = true;
  usuarioSeleccionado: { 
    usuario: Usuario, 
    archivos: { nombre: string, url: string }[], 
    documentacion?: Documentacion,
    criadero?: any
  } | null = null;
  archivoSeleccionado: { nombre: string, url: string } | null = null;

  filtroBusqueda: string = '';
  ordenSeleccionado: string | null = null;
  estadoSeleccionado: string | null = null;
  opcionesOrden = [
    { label: 'Recientemente añadido', value: 'reciente' },
    { label: 'Añadido más antiguo', value: 'antiguo' },
    { label: 'Nombre A-Z', value: 'nombreAsc' },
    { label: 'Nombre Z-A', value: 'nombreDesc' }
  ];
  mostrarModalEstado = false;
  mostrarModalConfirmacion = false;
  estadoPendienteCambio: Estado | null = null;
  motivoCambioEstado: string = '';
  estadoSeleccionadoParaCambio: Estado | null = null; 

  constructor(
    private archivosService: ArchivosService,
    private documentacionService: DocumentacionService,
    private criaderoService: CriaderoService
  ) {}

  async ngOnInit() {
    // Cargar estado, motivo y criadero para cada usuario
    this.usuarios = await this.archivosService.getUsuariosConDocumentosYCriadero();
    this.aplicarFiltros();
    this.loading = false;
  }

  aplicarFiltros() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    let filtrados = this.usuarios.filter(u => {
      const usuario = u.usuario;
      // Filtro por texto
      const coincideTexto =
        usuario.nombre?.toLowerCase().includes(filtro) ||
        usuario.telefono?.toLowerCase().includes(filtro) ||
        usuario.email?.toLowerCase().includes(filtro);

      // Filtro por estado
      const coincideEstado = !this.estadoSeleccionado || u.documentacion?.estado === this.estadoSeleccionado;

      return coincideTexto && coincideEstado;
    });

    // Ordenación
    switch (this.ordenSeleccionado) {
      case 'reciente':
        filtrados = filtrados.slice().reverse(); 
        break;
      case 'antiguo':
        // Nada, ya está por defecto
        break;
      case 'nombreAsc':
        filtrados = filtrados.slice().sort((a, b) =>
          (a.usuario.nombre).localeCompare(b.usuario.nombre)
        );
        break;
      case 'nombreDesc':
        filtrados = filtrados.slice().sort((a, b) =>
          (b.usuario.nombre).localeCompare(a.usuario.nombre)
        );
        break;
    }

    this.usuariosFiltrados = filtrados;
  }

  filtrarPorEstado(estado: Estado | null) {
  this.estadoSeleccionado = estado;
  this.aplicarFiltros();
  }

  seleccionarUsuario(usuario: { usuario: Usuario, archivos: { nombre: string, url: string }[], documentacion?: Documentacion }) {
    this.usuarioSeleccionado = usuario;
    this.archivoSeleccionado = null;
  }

  verArchivo(archivo: { nombre: string, url: string }) {
    this.archivoSeleccionado = archivo;
  }

  cerrarVisor() {
    this.archivoSeleccionado = null;
  }

  cerrarArchivosUsuario() {
    this.usuarioSeleccionado = null;
    this.archivoSeleccionado = null;
  }

  abrirModalEstado() {
    this.motivoCambioEstado = '';
    this.estadoSeleccionadoParaCambio = null;
    this.mostrarModalEstado = true;
  }

  cerrarModalEstado() {
    this.mostrarModalEstado = false;
  }

  // NUEVO: Seleccionar el estado antes de guardar
  seleccionarEstadoParaCambio(estado: Estado) {
    this.estadoSeleccionadoParaCambio = estado;
  }

  // Cambia para usar el estado seleccionado al pulsar guardar
  guardarCambioEstado() {
    if (!this.estadoSeleccionadoParaCambio) return;
    this.confirmarCambioEstado(this.estadoSeleccionadoParaCambio);
  }

  confirmarCambioEstado(nuevoEstado: Estado) {
    this.estadoPendienteCambio = nuevoEstado;
    this.mostrarModalConfirmacion = true;
    this.mostrarModalEstado = false; 
  }

  async aplicarCambioEstadoConfirmado() {
    if (!this.usuarioSeleccionado?.documentacion || !this.estadoPendienteCambio) return;

    // Actualiza en memoria
    this.usuarioSeleccionado.documentacion.estado = this.estadoPendienteCambio;
    this.usuarioSeleccionado.documentacion.motivo = this.motivoCambioEstado;

    console.log('Usuario seleccionado:', this.usuarioSeleccionado);

    // Actualiza en Firebase
    try {
      await this.documentacionService.guardarDocumentacion(
        this.usuarioSeleccionado.usuario.id,
        {
          ...this.usuarioSeleccionado.documentacion,
          estado: this.estadoPendienteCambio,
          motivo: this.motivoCambioEstado
        }
      );

      // Si el estado es ACEPTADO, marca el usuario como criadero verificado
      if (this.estadoPendienteCambio === Estado.ACEPTADO) {
        await this.criaderoService.actualizarVerificado(this.usuarioSeleccionado.usuario.id_criadero);
        this.usuarioSeleccionado.criadero.verificado = true;
      }
      // Si el estado anterior era ACEPTADO y el nuevo NO es ACEPTADO, desmarca como verificado
      else if (this.usuarioSeleccionado.criadero.verificado === true && this.estadoPendienteCambio === Estado.PENDIENTE || this.estadoPendienteCambio === Estado.RECHAZADO) {
        await this.criaderoService.actualizarVerificado(this.usuarioSeleccionado.usuario.id_criadero, false);
        this.usuarioSeleccionado.criadero.verificado = false;
      }

    } catch (error) {
      console.error('Error al actualizar la documentación:', error);
    }

    this.mostrarModalEstado = false;
    this.mostrarModalConfirmacion = false;
    this.estadoPendienteCambio = null;
    this.motivoCambioEstado = '';
    this.aplicarFiltros();
  }

  cancelarCambioEstado() {
    this.mostrarModalConfirmacion = false;
    this.estadoPendienteCambio = null;
  }
}
