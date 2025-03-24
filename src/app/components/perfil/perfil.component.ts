import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/Usuario.model';

@Component({
  selector: 'app-perfil',
  standalone: true, 
  imports: [CommonModule, FormsModule], // Agregar FormsModule aquí
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: Usuario | null = null;
  editMode: boolean = false; // Nueva propiedad para controlar el modo de edición

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

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // Aquí puedes agregar lógica para guardar los cambios si es necesario
      console.log('Datos guardados:', this.usuario);
    }
  }
}
