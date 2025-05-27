import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';
import { CriaderoService } from '../services/criadero.service';
import { DocumentacionService } from '../services/documentacion.service';

export const criadorGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const usuarioService = inject(UsuarioService);
  const criaderoService = inject(CriaderoService);
  const documentacionService = inject(DocumentacionService);
  const router = inject(Router);

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
    // Comprobar documentación
    const documentacion = await documentacionService.obtenerDocumentacion(userId);
    if (!documentacion) {
      router.navigate(['/inicio']);
      return false;
    }

    // Comprobar criadero y verificación
    const idCriadero = await usuarioService.getIdCriaderoByUsuarioId(userId);
    if (!idCriadero) {
      router.navigate(['/inicio']);
      return false;
    }

    const verificado = await criaderoService.getVerficadoById(idCriadero);
    if (!verificado) {
      router.navigate(['/inicio']);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en el guard criador:', error);
    router.navigate(['/inicio']);
    return false;
  }
};