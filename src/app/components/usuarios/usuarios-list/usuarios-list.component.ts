import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/Usuario.model';
import { UsuariosResumeComponent } from '../usuarios-resume/usuarios-resume.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, UsuariosResumeComponent, FormsModule], 
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.css'
})
export class UsuariosListComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  filtroBusqueda: string = '';

  constructor(private usuarioService: UsuarioService) {}

  async ngOnInit() {
    this.usuarios = await this.usuarioService.getAllUsuarios();
    this.usuariosFiltrados = this.usuarios;
  }

  aplicarFiltros() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    if (!filtro) {
      this.usuariosFiltrados = this.usuarios;
      return;
    }
    this.usuariosFiltrados = this.usuarios.filter(usuario =>
      (usuario.nombre?.toLowerCase().includes(filtro) || '') ||
      (usuario.email?.toLowerCase().includes(filtro) || '') ||
      (usuario.telefono?.toLowerCase().includes(filtro) || '')
    );
  }
}
