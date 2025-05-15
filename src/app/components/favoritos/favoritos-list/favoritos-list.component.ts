import { Component, OnInit } from '@angular/core';
import { AnunciosService } from '../../../services/anuncios.service';
import { FavoritosService } from '../../../services/favoritos.service';
import { CommonModule } from '@angular/common';
import { FavoritosResumeComponent } from '../favoritos-resume/favoritos-resume.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favoritos-list',
  standalone: true,
  imports: [
    CommonModule,
    FavoritosResumeComponent
  ],
  templateUrl: './favoritos-list.component.html',
  styleUrl: './favoritos-list.component.css'
})
export class FavoritosListComponent implements OnInit {
  anuncios: any[] = [];

  constructor(
    private anunciosService: AnunciosService,
    private router: Router,
    private favoritosService: FavoritosService
  ) {}

  ngOnInit(): void {
    this.cargarFavoritos();
  }

  cargarFavoritos(): void {
    this.favoritosService.getFavoritosIds().subscribe(idsFavoritos => {
      if (idsFavoritos.length === 0) {
        this.anuncios = [];
        return;
      }
      this.anunciosService.getAnuncios().subscribe(data => {
        this.anuncios = data
          .filter(anuncio => idsFavoritos.includes(anuncio.id))
          .sort((a, b) => {
            const fechaA = a.fecha_publicacion ? new Date(a.fecha_publicacion).getTime() : 0;
            const fechaB = b.fecha_publicacion ? new Date(b.fecha_publicacion).getTime() : 0;
            return fechaB - fechaA;
          });
      });
    });
  }

  verAnuncio(anuncio: any): void {
    this.router.navigate(['/anuncios', anuncio.id]);
  }
}
