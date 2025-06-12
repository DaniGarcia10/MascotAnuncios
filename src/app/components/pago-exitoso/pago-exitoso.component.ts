import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuscripcionesService } from '../../services/suscripciones.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PagosService } from '../../services/pagos.service';
import { Pago } from '../../models/Pago.Model';

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
    private pagosService: PagosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('[PagoExitoso] Iniciando proceso de pago exitoso');
    this.authService.getUserDataAuth().subscribe({
      next: async (auth) => {
        console.log('[PagoExitoso] Datos de auth:', auth);
        if (!auth || !auth.user) {
          this.mensaje = 'No se pudo obtener la información del usuario.';
          console.warn('[PagoExitoso] Usuario no autenticado');
          return;
        }
        const uid = auth.user?.uid;
        if (!uid) {
          this.mensaje = 'No se pudo obtener el UID del usuario.';
          console.warn('[PagoExitoso] UID no encontrado');
          return;
        }

        // Recoge el id_pago de los query params
        const id_pago = this.route.snapshot.queryParamMap.get('id_pago');
        console.log('[PagoExitoso] id_pago recibido:', id_pago);
        if (!id_pago) {
          this.mensaje = 'No se encontró el identificador del pago.';
          console.warn('[PagoExitoso] id_pago no presente en la URL');
          return;
        }

        try {
          // Busca el pago en Firestore
          const pago = await firstValueFrom(this.pagosService.obtenerPago(id_pago));
          console.log('[PagoExitoso] Resultado de búsqueda de pago:', pago);
          if (!pago) {
            this.mensaje = 'No se encontró el pago en la base de datos.';
            console.warn('[PagoExitoso] Pago no encontrado en Firestore');
            return;
          }
          if (!pago.pagado) {
            this.mensaje = 'El pago no está confirmado.';
            console.warn('[PagoExitoso] Pago encontrado pero no confirmado:', pago);
            return;
          }
          if (pago.id_usuario !== uid) {
            this.mensaje = 'El pago no pertenece al usuario autenticado.';
            console.warn('[PagoExitoso] El pago no pertenece al usuario:', pago, 'UID actual:', uid);
            return;
          }

          const duracion = pago.duracion || 30;
          console.log('[PagoExitoso] Duración del pago:', duracion);

          // Obtener usuario y su suscripción actual
          const usuario = await this.usuarioService.getUsuarioById(uid);
          console.log('[PagoExitoso] Usuario obtenido:', usuario);
          let suscripcionId = usuario?.suscripcion || null;

          if (suscripcionId) {
            // Hay suscripción previa, obtenerla
            const suscripcionActual = await firstValueFrom(this.suscripcionesService.obtenerSuscripcion(suscripcionId));
            console.log('[PagoExitoso] Suscripción actual:', suscripcionActual);
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
              console.log('[PagoExitoso] Suscripción renovada. Nueva fecha_fin:', nuevaFechaFin.toISOString());
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
          console.log('[PagoExitoso] Suscripción creada. ID:', suscripcionId);
          this.mensaje = '¡Suscripción creada con éxito!';
        } catch (error) {
          console.error('[PagoExitoso] Error al registrar la suscripción:', error);
          this.mensaje = 'Hubo un problema al procesar la suscripción.';
        }
      },
      error: (error) => {
        this.mensaje = 'No se pudo obtener la información del usuario.';
        console.error('[PagoExitoso] Error en getUserDataAuth:', error);
      }
    });
  }
}
