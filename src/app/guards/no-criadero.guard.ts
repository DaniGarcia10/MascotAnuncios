import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';

export const noCriaderoGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const usuarioService = inject(UsuarioService);
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
    const idCriadero = await usuarioService.getIdCriaderoByUsuarioId(userId);
    if (idCriadero) {
      router.navigate(['/inicio']);
      return false;
    }
    return true;
  } catch (error) {
    router.navigate(['/inicio']);
    return false;
  }
};
