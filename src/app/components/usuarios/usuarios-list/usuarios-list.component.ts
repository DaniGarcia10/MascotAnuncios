import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/Usuario.model';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.css'
})
export class UsuariosListComponent implements OnInit {
  usuarios: Usuario[] = [];

  constructor(private usuarioService: UsuarioService) {}

  async ngOnInit() {
    this.usuarios = await this.usuarioService.getAllUsuarios();
  }
}
