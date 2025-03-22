import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/Usuario.model';

@Component({
  selector: 'app-perfil',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: Usuario | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserDataAuth().subscribe({
      next: (data) => {
        this.usuario = data.usuario;
      },
      error: (err) => {
        console.error('Error al obtener los datos del usuario:', err);
      }
    });
  }
}
