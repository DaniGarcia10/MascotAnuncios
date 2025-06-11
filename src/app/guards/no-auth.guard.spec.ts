import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NoAuthGuard } from './no-auth.guard';
import { of } from 'rxjs';

describe('NoAuthGuard', () => {
  let guard: NoAuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const rSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        NoAuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    });

    guard = TestBed.inject(NoAuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('debería permitir el acceso si el usuario NO está autenticado', (done) => {
    authServiceSpy.isAuthenticated.and.returnValue(of(false));
    guard.canActivate().subscribe(result => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('debería redirigir si el usuario está autenticado', (done) => {
    const urlTree = {} as any;
    routerSpy.createUrlTree.and.returnValue(urlTree);
    authServiceSpy.isAuthenticated.and.returnValue(of(true));
    guard.canActivate().subscribe(result => {
      expect(result).toBe(urlTree);
      done();
    });
  });
});
