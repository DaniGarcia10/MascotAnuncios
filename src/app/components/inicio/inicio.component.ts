import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { Auth } from '@angular/fire/auth';
import { ImagenService } from '../../services/imagen.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importar Router para la navegación
import { RAZAS } from '../../data/razas'; // Importar el archivo de razas


@Component({
  selector: 'app-inicio',
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  imagenUrl: string | null = null;
  razas: string[] = []; // Lista de razas
  tipoSeleccionado: 'perros' | 'gatos' | null = null; // Tipo seleccionado
  razaHabilitada: boolean = false; // Controla si el dropdown está habilitado
  razaSeleccionada: string | null = null;

  constructor(
    private auth: Auth,
    private usuarioService: UsuarioService,
    private imagenService: ImagenService,
    private router: Router // Inyectar Router para la navegación
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

  onTipoSeleccionado(tipo: 'perros' | 'gatos'): void {
    this.tipoSeleccionado = tipo;
    this.razaSeleccionada = null; // Limpiar la raza cuando cambias de tipo
    this.razaHabilitada = true;

    // Obtener las razas directamente desde RAZAS
    this.razas = RAZAS[tipo];
  }

  seleccionarRaza(raza: string): void {
    this.razaSeleccionada = raza;
  }

  buscar(): void {
    const queryParams: any = {};

    if (this.tipoSeleccionado) {
      queryParams.tipoAnimal = this.tipoSeleccionado.slice(0, -1); // 'perros' -> 'perro'
    }
    if (this.razaSeleccionada) {
      queryParams.raza = this.razaSeleccionada;
    }

    this.router.navigate(['/anuncios'], { queryParams });
  }
}