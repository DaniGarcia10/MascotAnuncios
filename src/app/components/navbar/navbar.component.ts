import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ArchivosService } from '../../services/archivos.service';
import { CriaderoService } from '../../services/criadero.service';
import { UsuarioService } from '../../services/usuario.service'; // Asegúrate de importar el servicio UsuarioService

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  esVendedor = false;
  esAdmin = false;
  logoUrl: string = ''; 
  verificado: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private archivosService: ArchivosService, 
    private criaderoService: CriaderoService,
    private usuarioService: UsuarioService 
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe((authStatus) => {
      this.isAuthenticated = !!authStatus;

      if (this.isAuthenticated) {
        // Solo si está autenticado, obtenemos el userId y comprobamos la documentación
        const userId = this.authService.getUsuarioId();
        if (userId) {
          this.usuarioService.getIdCriaderoByUsuarioId(userId).then((idCriadero) => {
            if (idCriadero) {
              this.criaderoService.getVerficadoById(idCriadero).then((verificado) => {
                this.verificado = verificado;
              }).catch((error) => {
                console.error('Error al obtener el estado de verificación del criadero:', error);
              });
            }
          }).catch((error) => {
            console.error('Error al obtener el id del criadero:', error);
          });
        }
      }
    });

    this.authService.getUserDataAuth().subscribe(({ usuario }) => {
      this.esVendedor = usuario?.vendedor ?? false;
      this.esAdmin = usuario?.email === 'danielgarciapelaez@gmail.com';
    });

    // Cargar la URL del logo
    this.archivosService.cargarImagenes(['logo1.png']).then((urls) => {
      this.logoUrl = urls[0]; // Asignar la URL del logo
    });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
