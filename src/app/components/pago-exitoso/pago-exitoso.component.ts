import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuscripcionesService } from '../../services/suscripciones.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-pago-exitoso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pago-exitoso.component.html',
  styleUrls: ['./pago-exitoso.component.css']
})
export class PagoExitosoComponent implements OnInit {

  mensaje = 'Procesando tu suscripción...';

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private suscripcionesService: SuscripcionesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.getUserDataAuth().subscribe({
      next: async (auth) => {
        if (!auth || !auth.user) {
          this.mensaje = 'No se pudo obtener la información del usuario.';
          return;
        }
        const uid = auth.user?.uid;
        if (!uid) {
          this.mensaje = 'No se pudo obtener el UID del usuario.';
          return;
        }

        // Recoge la duración de los query params
        const duracionParam = this.route.snapshot.queryParamMap.get('duracion');
        const duracion = Number(duracionParam) || 30;

        try {
          // Obtener usuario y su suscripción actual
          const usuario = await this.usuarioService.getUsuarioById(uid);
          let suscripcionId = usuario?.suscripcion || null;
          console.log('Id de suscripción actual:', suscripcionId);

          if (suscripcionId) {
            // Hay suscripción previa, obtenerla
            const suscripcionActual = await firstValueFrom(this.suscripcionesService.obtenerSuscripcion(suscripcionId));
            if (suscripcionActual) {
              // Calcular nueva fecha_fin
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

              // Actualizar la suscripción existente
              await this.suscripcionesService.actualizarSuscripcion(suscripcionId, {
                fecha_fin: nuevaFechaFin.toISOString()
              });

              this.mensaje = '¡Suscripción renovada con éxito!';
              return;
            }
          }

          // Si no hay suscripción previa, crear una nueva
          const fechaAlta = new Date();
          const fechaFin = new Date();
          fechaFin.setDate(fechaAlta.getDate() + duracion);

          const nuevaSuscripcion = {
            fecha_alta: fechaAlta.toISOString(),
            fecha_fin: fechaFin.toISOString()
          };

          suscripcionId = await this.suscripcionesService.crearSuscripcion(nuevaSuscripcion);
          await this.usuarioService.actualizarUsuario(uid, { suscripcion: suscripcionId });
          this.mensaje = '¡Suscripción creada con éxito!';
        } catch (error) {
          console.error('Error al registrar la suscripción:', error);
          this.mensaje = 'Hubo un problema al procesar la suscripción.';
        }
      },
      error: (error) => {
        this.mensaje = 'No se pudo obtener la información del usuario.';
      }
    });
  }
}
