import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private adminEmail = 'danielgarciapelaez@gmail.com';

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.getUserDataAuth().pipe(
      take(1),
      map(({ usuario }) => {
        if (usuario && usuario.email === this.adminEmail) {
          return true;
        }
        // Redirige a inicio si no es admin
        return this.router.createUrlTree(['/inicio']);
      })
    );
  }
}
