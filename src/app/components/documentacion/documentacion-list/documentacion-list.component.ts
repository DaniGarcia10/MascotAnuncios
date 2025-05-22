import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentacionService } from '../../../services/documentacion.service';
import { SafeUrlPipe } from '../../../pipes/safe-url.pipe';
import { Usuario } from '../../../models/Usuario.model';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-documentacion-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, SafeUrlPipe],
  templateUrl: './documentacion-list.component.html',
  styleUrls: ['./documentacion-list.component.css']
})
export class DocumentacionListComponent implements OnInit {
  usuarios: { usuario: Usuario, archivos: { nombre: string, url: string }[] }[] = [];
  usuariosFiltrados: { usuario: Usuario, archivos: { nombre: string, url: string }[] }[] = [];
  loading = true;
  usuarioSeleccionado: { usuario: Usuario, archivos: { nombre: string, url: string }[] } | null = null;
  archivoSeleccionado: { nombre: string, url: string } | null = null;

  filtroBusqueda: string = '';
  ordenSeleccionado: string = '';
  opcionesOrden = [
    { label: 'Recientemente añadido', value: 'reciente' },
    { label: 'Añadido más antiguo', value: 'antiguo' },
    { label: 'Nombre A-Z', value: 'nombreAsc' },
    { label: 'Nombre Z-A', value: 'nombreDesc' }
  ];

  constructor(private documentacionService: DocumentacionService) {}

  async ngOnInit() {
    this.usuarios = await this.documentacionService.getUsuariosConDocumentos();
    this.aplicarFiltros();
    this.loading = false;
  }

  aplicarFiltros() {
    // Filtrado
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    let filtrados = this.usuarios.filter(u => {
      const usuario = u.usuario;
      return (
        usuario.nombre?.toLowerCase().includes(filtro) ||
        usuario.apellidos?.toLowerCase().includes(filtro) ||
        usuario.telefono?.toLowerCase().includes(filtro) ||
        usuario.email?.toLowerCase().includes(filtro)
      );
    });

    // Ordenación
    switch (this.ordenSeleccionado) {
      case 'reciente':
        filtrados = filtrados.slice().reverse(); // Asume que el array original está de antiguo a reciente
        break;
      case 'antiguo':
        // Nada, ya está por defecto
        break;
      case 'nombreAsc':
        filtrados = filtrados.slice().sort((a, b) =>
          (a.usuario.nombre + ' ' + a.usuario.apellidos).localeCompare(b.usuario.nombre + ' ' + b.usuario.apellidos)
        );
        break;
      case 'nombreDesc':
        filtrados = filtrados.slice().sort((a, b) =>
          (b.usuario.nombre + ' ' + b.usuario.apellidos).localeCompare(a.usuario.nombre + ' ' + a.usuario.apellidos)
        );
        break;
    }

    this.usuariosFiltrados = filtrados;
  }

  seleccionarUsuario(usuario: { usuario: Usuario, archivos: { nombre: string, url: string }[] }) {
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
}
