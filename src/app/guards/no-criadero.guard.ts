import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';
import { CriaderoService } from '../services/criadero.service';
import { DocumentacionService } from '../services/documentacion.service';

export const noCriaderoGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);
  const documentacionService = inject(DocumentacionService);
  const criaderoService = inject(CriaderoService);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const userId = authService.getUsuarioId();
  if (!userId) {
    router.navigate(['/login']);
    return false;
  }

  try {
    // Comprobar criadero y verificación
    const idCriadero = await usuarioService.getIdCriaderoByUsuarioId(userId);
    if (idCriadero && idCriadero !== null) {
      const verificado = await criaderoService.getVerficadoById(idCriadero);
      if (!verificado) {
        return true;
      }
    }
    // Comprobar documentación
    const documentacion = await documentacionService.obtenerDocumentacion(userId);
    if (!documentacion) {
      return true;
    } else {
      // Si el usuario tiene documentación y no es ACEPTADO
      if (documentacion.estado !== 'ACEPTADO') {
        return true;
      }

    // Si el usuario tiene documentación ACEPTADA, criadero verificado, no puede pasar
    router.navigate(['/inicio']);
    return false;
  }
  } catch (error) {
    router.navigate(['/inicio']);
    return false;
  }
};
