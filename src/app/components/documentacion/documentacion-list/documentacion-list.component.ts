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
  usuarios: { usuario: Usuario, url: string }[] = [];
  loading = true;
  archivoSeleccionado: { usuario: Usuario, url: string } | null = null;

  constructor(private documentacionService: DocumentacionService) {}

  async ngOnInit() {
    this.usuarios = await this.documentacionService.getUsuariosConDocumentos();
    this.loading = false;
  }

  verArchivo(usuario: { usuario: Usuario, url: string }) {
    this.archivoSeleccionado = usuario;
  }

  cerrarVisor() {
    this.archivoSeleccionado = null;
  }
}
