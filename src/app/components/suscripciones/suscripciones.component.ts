import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { SuscripcionesService } from '../../services/suscripciones.service';
import { UsuarioService } from '../../services/usuario.service';
import { Suscripcion } from '../../models/Suscripcion.model';
import { Usuario } from '../../models/Usuario.model';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-suscripciones',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule, FormsModule],
  templateUrl: './suscripciones.component.html',
  styleUrls: ['./suscripciones.component.css']
})
export class SuscripcionesComponent implements OnInit {
  activeSection: string = 'ver';
  suscripcionForm: FormGroup;
  suscripcion$: Observable<Suscripcion | null> | null = null;
  precioSeleccionado: number | null = null; 

  planes = [
    { value: 30, label: '1 mes', precio: 9.99, ahorro: 'Ahorra un 0%' },
    { value: 90, label: '3 meses', precio: 24.99, ahorro: 'Ahorra un 16%' },
    { value: 180, label: '6 meses', precio: 44.99, ahorro: 'Ahorra un 25%' },
    { value: 365, label: '12 meses', precio: 79.99, ahorro: 'Ahorra un 33%' }
  ];

  constructor(
    private fb: FormBuilder,
    private suscripcionesService: SuscripcionesService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private route: ActivatedRoute // <--- Añadido
  ) {
    this.suscripcionForm = this.fb.group({
      duracion: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.getUserDataAuth().subscribe({
      next: (authData) => {
        const userId = authData.user?.uid || '';
        if (userId) {
          this.usuarioService.getUsuarioById(userId).then((usuario: Usuario | null) => {
            if (usuario?.suscripcion) {
              this.suscripcion$ = this.suscripcionesService.obtenerSuscripcion(usuario.suscripcion);
            }
          }).catch((error) => {
            console.error('Error al obtener el usuario:', error);
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener los datos de autenticación:', error);
      }
    });
    this.route.queryParams.subscribe(params => {
      if (params['contratar']) {
        this.activeSection = 'contratar';
      }
    });
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  seleccionar(plan: any): void {
    this.suscripcionForm.get('duracion')?.setValue(plan.value);
    this.precioSeleccionado = plan.precio;
  }

  crearSuscripcion(): void {
    if (this.suscripcionForm.valid) {
      const duracion = this.suscripcionForm.value.duracion;
      const precio = this.planes.find(p => p.value === duracion)?.precio || 0;
      console.log('Suscripción creada:', {
        duracion,
        precio
      });
      // Aquí puedes seguir con la lógica de creación o redirigir al pago
    }
  }
}
