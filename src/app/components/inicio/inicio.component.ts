import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { Auth, User } from '@angular/fire/auth';
import { ImagenService } from '../../services/imagen.service'; // Importar ImagenService
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  imagenUrl: string | null = null; // Variable para almacenar la URL de la imagen

  constructor(
    private auth: Auth,
    private usuarioService: UsuarioService,
    private imagenService: ImagenService // Inyectar ImagenService
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user) {
      this.usuarioService.getUsuarioById(user.uid).then((usuario) => {
        console.log('Datos del usuario:', { user, usuario });
      }).catch((error) => {
        console.error('Error al obtener los datos del usuario:', error);
      });
    } else {
      console.log('No hay usuario autenticado');
    }

    // Cargar la imagen inicio.jpg
    this.imagenService.cargarImagenes(['inicio.jpg']).then((urls) => {
      this.imagenUrl = urls[0];
    }).catch((error) => {
      console.error('Error al cargar la imagen:', error);
    });
  }
}