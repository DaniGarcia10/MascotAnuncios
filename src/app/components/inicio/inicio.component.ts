import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserDataAuth().subscribe({
      next: (data) => {
        console.log('Datos del usuario:', data);
      },
      error: (error) => {
        console.error('Error al obtener los datos del usuario:', error);
      }
    });
  }
}