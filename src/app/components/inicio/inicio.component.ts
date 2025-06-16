import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { Auth } from '@angular/fire/auth';
import { ArchivosService } from '../../services/archivos.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DatosService } from '../../services/datos.service'; 

@Component({
  selector: 'app-inicio',
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  imagenUrl: string | null = null;
  razas: string[] = [];
  tipoSeleccionado: 'perros' | 'gatos' | null = null;
  razaHabilitada: boolean = false;
  razaSeleccionada: string | null = null;

  constructor(
    private auth: Auth,
    private usuarioService: UsuarioService,
    private archivosService: ArchivosService,
    private router: Router,
    private datosService: DatosService 
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user) {
      this.usuarioService.getUsuarioById(user.uid).then((usuario) => {
      }).catch((error: any) => {
        console.error('Error al obtener los datos del usuario:', error);
      });
    } else {
    }

    this.archivosService.cargarImagenes(['inicio.webp']).then((urls: string[]) => {
      this.imagenUrl = urls[0];
    }).catch((error: any) => {
      console.error('Error al cargar la imagen:', error);
    });

  }

  onTipoSeleccionado(tipo: 'perros' | 'gatos'): void {
    this.tipoSeleccionado = tipo;
    this.razaSeleccionada = null;
    this.razaHabilitada = true;

    // Obtener las razas usando DatosService y su caché
    const tipoSingular = tipo === 'perros' ? 'perro' : 'gato';
    this.datosService.obtenerRazas(tipoSingular).then((razas) => {
      this.razas = razas;
    }).catch(() => {
      this.razas = [];
    });
  }

  seleccionarRaza(raza: string): void {
    this.razaSeleccionada = raza;
  }

  buscar(): void {
    const queryParams: any = {};

    if (this.tipoSeleccionado) {
      queryParams.tipoAnimal = this.tipoSeleccionado.slice(0, -1); 
    }
    if (this.razaSeleccionada) {
      queryParams.raza = this.razaSeleccionada;
    }

    this.router.navigate(['/anuncios'], { queryParams });
  }
}