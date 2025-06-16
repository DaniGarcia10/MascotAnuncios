import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnunciosService } from '../../../services/anuncios.service';
import { AuthService } from '../../../services/auth.service'; 
import { CommonModule } from '@angular/common';
import { MisanunciosResumeComponent } from '../misanuncios-resume/misanuncios-resume.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-misanuncios-list',
  standalone: true,
  imports: [CommonModule, MisanunciosResumeComponent],
  templateUrl: './misanuncios-list.component.html',
  styleUrls: ['./misanuncios-list.component.css']
})
export class MisanunciosListComponent implements OnInit, OnDestroy {
  anunciosFiltrados: any[] = [];
  cargando: boolean = true;
  private userSub: Subscription | undefined;

  mostrarModal: boolean = false;
  anuncioAEliminar: any = null;

  constructor(
    private readonly anunciosService: AnunciosService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.getUserDataAuth().subscribe(({ user }) => {
      if (user) {
        this.cargarMisAnuncios(user.uid);
      } else {
        this.anunciosFiltrados = [];
        this.cargando = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  cargarMisAnuncios(usuarioId: string): void {
    this.cargando = true;
    this.anunciosService.getAnunciosPorUsuario(usuarioId).subscribe(data => {
      this.anunciosFiltrados = data.sort((a, b) => {
        const fechaA = a.fecha_publicacion ? new Date(a.fecha_publicacion).getTime() : 0;
        const fechaB = b.fecha_publicacion ? new Date(b.fecha_publicacion).getTime() : 0;
        return fechaB - fechaA;
      });
      this.cargando = false;
    });
  }

  editarAnuncio(anuncio: any): void {
    this.router.navigate(['/mis-anuncios', anuncio.id, 'editar']);
  }

  // Llama este método desde el hijo
  solicitarEliminar(anuncio: any): void {
    this.anuncioAEliminar = anuncio;
    this.mostrarModal = true;
  }

  cancelarEliminar(): void {
    this.mostrarModal = false;
    this.anuncioAEliminar = null;
  }

  confirmarEliminar(): void {
    if (!this.anuncioAEliminar) return;
    this.anunciosService.eliminarAnuncio(this.anuncioAEliminar.id).subscribe(() => {
      this.anunciosFiltrados = this.anunciosFiltrados.filter(a => a.id !== this.anuncioAEliminar.id);
      this.cancelarEliminar();
    });
  }

  activarAnuncio(anuncio: any): void {
    this.anunciosService.actualizarAnuncio(anuncio.id, { activo: true }).then(() => {
      anuncio.activo = true;
    });
  }

}
