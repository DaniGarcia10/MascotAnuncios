import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AnunciosService } from '../services/anuncios.service';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

export const anuncioActivoGuardGuard: CanActivateFn = (route, state) => {
  const anunciosService = inject(AnunciosService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    router.navigate(['/anuncios']);
    return of(false);
  }

  return anunciosService.getAnuncios().pipe(
    map(anuncios => {
      const anuncio = anuncios.find(a => a.id === id);
      if (anuncio && anuncio.activo) {
        return true;
      } else {
        router.navigate(['/anuncios']);
        return false;
      }
    })
  );
};
