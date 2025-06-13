import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DenunciasService } from '../../../services/denuncias.service';
import { Denuncia } from '../../../models/Denuncia.model';
import { FormsModule } from '@angular/forms';
import { DenunciasResumeComponent } from '../denuncias-resume/denuncias-resume.component';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/Usuario.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-denuncias-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DenunciasResumeComponent,
    RouterModule
  ],
  templateUrl: './denuncias-list.component.html',
  styleUrls: ['./denuncias-list.component.css']
})
export class DenunciasListComponent implements OnInit {
  denuncias: Denuncia[] = [];
  denunciasFiltradas: Denuncia[] = [];
  loading = true;

  filtroBusqueda: string = '';
  revisadaSeleccionada: boolean | null = null;
  denunciaSeleccionada: Denuncia | null = null;
  usuarioDenunciado: Usuario | null = null;

  constructor(
    private denunciasService: DenunciasService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.denunciasService.obtenerDenuncias().subscribe(denuncias => {
      this.denuncias = denuncias;
      this.aplicarFiltros();
      this.loading = false;
    });
  }

  aplicarFiltros() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.denunciasFiltradas = this.denuncias.filter(d => {
      const coincideTexto =
        d.email?.toLowerCase().includes(filtro) ||
        d.motivo?.toLowerCase().includes(filtro) ||
        d.id_anuncio?.toLowerCase().includes(filtro);

      const coincideRevisada =
        this.revisadaSeleccionada === null ||
        d.revisada === this.revisadaSeleccionada;

      return coincideTexto && coincideRevisada;
    });
  }

  filtrarPorRevisada(valor: boolean | null) {
    this.revisadaSeleccionada = valor;
    this.aplicarFiltros();
  }

  seleccionarDenuncia(denuncia: Denuncia) {
    this.denunciaSeleccionada = denuncia;
    this.usuarioDenunciado = null;
    if (denuncia.id_usuario) {
      this.usuarioService.getUsuarioById(denuncia.id_usuario)
        .then(usuario => this.usuarioDenunciado = usuario)
        .catch(() => this.usuarioDenunciado = null);
    }
  }


  cambiarEstadoRevisada() {
    if (this.denunciaSeleccionada && this.denunciaSeleccionada.id) {
      const nuevoEstado = !this.denunciaSeleccionada.revisada;
      this.denunciasService.actualizarEstadoRevisada(this.denunciaSeleccionada.id, nuevoEstado)
        .then(() => {
          this.denunciaSeleccionada!.revisada = nuevoEstado;
          this.aplicarFiltros();
        });
    }
  }
}
