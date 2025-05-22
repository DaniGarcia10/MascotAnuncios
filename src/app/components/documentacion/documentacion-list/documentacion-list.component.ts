import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentacionService } from '../../../services/documentacion.service';
import { SafeUrlPipe } from '../../../pipes/safe-url.pipe';
import { Usuario } from '../../../models/Usuario.model';

@Component({
  selector: 'app-documentacion-list',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './documentacion-list.component.html',
  styleUrls: ['./documentacion-list.component.css']
})
export class DocumentacionListComponent implements OnInit {
  usuarios: { usuario: Usuario, archivos: { nombre: string, url: string }[] }[] = [];
  loading = true;
  usuarioSeleccionado: { usuario: Usuario, archivos: { nombre: string, url: string }[] } | null = null;
  archivoSeleccionado: { nombre: string, url: string } | null = null;

  constructor(private documentacionService: DocumentacionService) {}

  async ngOnInit() {
    this.usuarios = await this.documentacionService.getUsuariosConDocumentos();
    this.loading = false;
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
