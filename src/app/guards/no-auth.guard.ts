import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated().pipe(
      filter(isLoggedIn => isLoggedIn !== null), // Espera a que Firebase determine el estado
      take(1),
      map(isLoggedIn => {
        if (isLoggedIn) {
          return this.router.createUrlTree(['/inicio']);
        }
        return true;
      })
    );
  }
}
