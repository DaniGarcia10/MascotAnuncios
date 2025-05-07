import { Component, OnInit } from '@angular/core';
import { AnunciosService } from '../../../services/anuncios.service';
import { AuthService } from '../../../services/auth.service'; // Importar el servicio de autenticación
import { CommonModule } from '@angular/common';
import { MisanunciosResumeComponent } from '../misanuncios-resume/misanuncios-resume.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-misanuncios-list',
  standalone: true,
  imports: [CommonModule, MisanunciosResumeComponent],
  templateUrl: './misanuncios-list.component.html',
  styleUrls: ['./misanuncios-list.component.css']
})
export class MisanunciosListComponent implements OnInit {
  anunciosFiltrados: any[] = [];

  constructor(private anunciosService: AnunciosService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.cargarMisAnuncios();
  }

  cargarMisAnuncios(): void {
    this.authService.getUserDataAuth().subscribe(({ user }) => {
      if (user) {
        const usuarioId = user.uid;
        this.anunciosService.getAnuncios().subscribe(data => {
          this.anunciosFiltrados = data
            .filter(anuncio => anuncio.id_usuario === usuarioId)
            .sort((a, b) => {
              const fechaA = a.fecha_publicacion ? new Date(a.fecha_publicacion).getTime() : 0;
              const fechaB = b.fecha_publicacion ? new Date(b.fecha_publicacion).getTime() : 0;
              return fechaB - fechaA; // Orden descendente (más reciente primero)
            });
        });
      } else {
        this.anunciosFiltrados = [];
      }
    });
  }
  

  editarAnuncio(anuncio: any): void {
    this.router.navigate(['/mis-anuncios', anuncio.id, 'editar']);
  }

}
