import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SuscripcionesService } from '../../../services/suscripciones.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Suscripcion } from '../../../models/Suscripcion.model';
import { Usuario } from '../../../models/Usuario.model';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-suscripciones',
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule, FormsModule],
  templateUrl: './suscripciones.component.html',
  styleUrls: ['./suscripciones.component.css']
})
export class SuscripcionesComponent implements OnInit {
  activeSection: string = 'ver';
  suscripcionForm: FormGroup;
  suscripcion$: Observable<Suscripcion | null> | null = null;
  duracionOptions = [
    { label: '1 mes', value: 30 },
    { label: '3 meses', value: 90 },
    { label: '6 meses', value: 180 },
    { label: '1 año', value: 365 }
  ];
  selectedDuracion: number | null = null;

  constructor(
    private suscripcionesService: SuscripcionesService,
    private usuarioService: UsuarioService,
    private authService: AuthService // Inyectar AuthService aquí
  ) {
    const now = new Date().toISOString().slice(0, 16); // Formato compatible con datetime-local
    this.suscripcionForm = new FormGroup({
      duracion: new FormControl('', [Validators.required, Validators.min(1)]),
      fecha_alta: new FormControl(now, [Validators.required]), // Fecha actual por defecto
    });
  }

  ngOnInit(): void {
    this.authService.getUserDataAuth().subscribe({
      next: (authData) => {
        const userId = authData.user?.uid || '';
        if (userId) {
          this.usuarioService.getUsuarioById(userId).then((usuario: Usuario | null) => {
            console.log('Usuario cargado:', usuario);
            if (usuario?.suscripcion) {
              this.suscripcion$ = this.suscripcionesService.obtenerSuscripcion(usuario.suscripcion);
            } else {
              console.warn('El usuario no tiene una suscripción asociada.');
            }
          }).catch((error) => {
            console.error('Error al obtener el usuario:', error);
          });
        } else {
          console.warn('No se pudo obtener el ID del usuario autenticado.');
        }
      },
      error: (error) => {
        console.error('Error al obtener los datos de autenticación:', error);
      }
    });
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  crearSuscripcion(): void {
    if (this.suscripcionForm.valid) {
      console.log('Suscripción creada:', this.suscripcionForm.value);
      // Lógica para crear la suscripción
    }
  }

  onDuracionChange(event: number): void {
    this.suscripcionForm.get('duracion')?.setValue(event);
  }
}
