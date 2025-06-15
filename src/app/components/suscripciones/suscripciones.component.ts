import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { SuscripcionesService } from '../../services/suscripciones.service';
import { UsuarioService } from '../../services/usuario.service';
import { Suscripcion } from '../../models/Suscripcion.model';
import { Usuario } from '../../models/Usuario.model';
import { Observable, firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PagosService } from '../../services/pagos.service'; 

@Component({
  selector: 'app-suscripciones',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule, FormsModule, HttpClientModule],
  templateUrl: './suscripciones.component.html',
  styleUrls: ['./suscripciones.component.css']
})
export class SuscripcionesComponent implements OnInit {
  activeSection: string = 'ver';
  suscripcionForm: FormGroup;
  suscripcion$: Observable<Suscripcion | null> | null = null;
  precioSeleccionado: number | null = null;
  procesando: boolean = false;
  procesandoPago: boolean = false;

  
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
    private pagosService: PagosService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private http: HttpClient
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

  async crearSuscripcion(): Promise<void> {
    if (this.procesando) return; 
    this.procesando = true;
    try {
      if (this.suscripcionForm.valid) {
        const duracion = this.suscripcionForm.value.duracion;

        this.authService.getUserDataAuth().subscribe({
          next: async (authData) => {
            const userId = authData.user?.uid || '';
            if (!userId) {
              return;
            }

            // Obtener usuario y su suscripción actual
            const usuario = await this.usuarioService.getUsuarioById(userId);
            let suscripcionId = usuario?.suscripcion || null;

            if (suscripcionId) {
              const suscripcionActual = await firstValueFrom(this.suscripcionesService.obtenerSuscripcion(suscripcionId));
              if (!suscripcionActual) {
                suscripcionId = null; 
              } else {
                const ahoraMadrid = new Date(
                  new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' })
                );
                const fechaFinActual = new Date(suscripcionActual.fecha_fin);

                let nuevaFechaFin: Date;
                if (fechaFinActual > ahoraMadrid) {
                  nuevaFechaFin = new Date(fechaFinActual);
                  nuevaFechaFin.setDate(nuevaFechaFin.getDate() + duracion);
                } else {
                  nuevaFechaFin = new Date(ahoraMadrid);
                  nuevaFechaFin.setDate(nuevaFechaFin.getDate() + duracion);
                }

                // Actualizar la suscripción existente (sin duracion)
                await this.suscripcionesService.actualizarSuscripcion(suscripcionId!, {
                  fecha_fin: nuevaFechaFin.toISOString()
                });

                this.suscripcion$ = this.suscripcionesService.obtenerSuscripcion(suscripcionId!);
                this.activeSection = 'ver';
                return;
              }
            }

            // Si llegamos aquí, es porque no hay una suscripción válida, así que creamos una nueva
            const fechaAlta = new Date();
            const fechaFin = new Date();
            fechaFin.setDate(fechaAlta.getDate() + duracion);

            const nuevaSuscripcion = {
              fecha_alta: fechaAlta.toISOString(),
              fecha_fin: fechaFin.toISOString()
            };

            try {
              suscripcionId = await this.suscripcionesService.crearSuscripcion(nuevaSuscripcion);
              if (!suscripcionId) {
                return;
              }
              await this.usuarioService.actualizarUsuario(userId, { suscripcion: suscripcionId });
              this.suscripcion$ = this.suscripcionesService.obtenerSuscripcion(suscripcionId);
              this.activeSection = 'ver';
            } catch (error) {
              // Manejo de error opcional
            }
          },
        });
      }
    } finally {
      this.procesando = false;
    }
  }

  esSuscripcionActiva(suscripcion: Suscripcion): boolean {
    if (!suscripcion.fecha_fin) return false;

    // Obtener la fecha actual en horario de Madrid
    const ahoraMadrid = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' })
    );

    // Convertir la fecha de fin a objeto Date (asumiendo que es ISO string en UTC)
    const fechaFin = new Date(suscripcion.fecha_fin);

    return fechaFin > ahoraMadrid;
  }

  getDiasRestantes(suscripcion: Suscripcion): number {
    if (!suscripcion.fecha_fin) return 0;
    const ahoraMadrid = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' })
    );
    const fechaFin = new Date(suscripcion.fecha_fin);
    const diff = fechaFin.getTime() - ahoraMadrid.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  }

  async iniciarPagoStripe(): Promise<void> {
    if (this.procesandoPago) return;
    this.procesandoPago = true;
    const precio = this.precioSeleccionado;
    const duracion = this.suscripcionForm.get('duracion')?.value;
    if (!precio || !duracion) {
      this.procesandoPago = false;
      return;
    }

    // 1. Obtener el usuario autenticado
    this.authService.getUserDataAuth().subscribe({
      next: async (authData) => {
        const userId = authData.user?.uid || '';
        if (!userId) {
          this.procesandoPago = false;
          return;
        }

        // 2. Crear el pago en Firebase y obtener el id generado automáticamente
        try {
          const pagoRef = await this.pagosService.guardarPagoAutoId({
            duracion,
            id_usuario: userId,
            pagado: false
          });
          const id_pago = pagoRef.id;

          // 3. Llamar al backend para crear la sesión de Stripe, pasando el id_pago
          this.http.post<{ url: string }>(
            'https://us-central1-mascotanunicos.cloudfunctions.net/createCheckoutSession',
            { precio, duracion, id_pago }
          ).subscribe({
            next: (res) => {
              window.location.href = res.url;
            },
            error: (err) => {
              console.error('Error al iniciar pago con Stripe:', err);
              this.procesandoPago = false;
            }
          });
        } catch (error) {
          console.error('Error al guardar el pago:', error);
          this.procesandoPago = false;
        }
      },
      error: () => {
        this.procesandoPago = false;
      }
    });
  }
}
