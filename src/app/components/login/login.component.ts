import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ImagenService } from '../../services/imagen.service';
import { CommonModule } from '@angular/common';

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
  constructor(private authService: AuthService, private imagenService: ImagenService) {
    this.formLogin = new FormGroup({
      email: new FormControl(),
      password: new FormControl(),
    });
  }

  ngOnInit(): void {
    // Cargar la imagen login.jpg
    this.imagenService.cargarImagenes(['login.jpg']).then((urls) => {
      this.imagenUrl = urls[0];
    }).catch((error) => {
      console.error('Error al cargar la imagen:', error);
    });
  }

  onSubmit(): void {
    const { email, password } = this.formLogin.value;
    this.authService.login(email, password).then((response: any) => {
      console.log('Login exitoso:', response);
    }).catch((error: any) => {
      console.error('Error en el login:', error.message);
    });
  }
}
