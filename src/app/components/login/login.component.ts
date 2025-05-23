import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ArchivosService } from '../../services/archivos.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class LoginComponent implements OnInit {
  formLogin: FormGroup;
  imagenUrl: string | null = null; 
  constructor(
    private authService: AuthService, 
    private archivosService: ArchivosService,
    private router: Router // Inyectar Router
  ) {
    this.formLogin = new FormGroup({
      email: new FormControl(),
      password: new FormControl(),
    });
  }

  ngOnInit(): void {
    // Si necesitas cargar imágenes aquí, usa archivosService
  }

  onSubmit(): void {
    const { email, password } = this.formLogin.value;
    this.authService.login(email, password).then((response: any) => {
      this.router.navigate(['/anuncios']); // Redirigir a /anuncios
    }).catch((error: any) => {
      console.error('Error en el login:', error.message);
    });
  }
}
