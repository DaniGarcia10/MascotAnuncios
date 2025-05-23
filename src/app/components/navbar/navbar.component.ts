import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ArchivosService } from '../../services/archivos.service';

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
  constructor(
    private authService: AuthService,
    private router: Router,
    private archivosService: ArchivosService // Inyectar el servicio de archivos
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe((authStatus) => {
      this.isAuthenticated = !!authStatus; // Fuerza a booleano, nunca será null
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
