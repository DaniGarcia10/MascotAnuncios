import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Auth } from '@angular/fire/auth';
import { UsuarioService } from './usuario.service';
import { firebaseMocks } from '../../testing/mock-providers';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...firebaseMocks,
        { 
          provide: Auth, 
          useValue: { 
            currentUser: { uid: 'test-uid' },
            onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.callFake((callback: any) => {
              // Simula un usuario autenticado inmediatamente
              callback({ uid: 'test-uid' });
              // Devuelve una función de desuscripción dummy
              return () => {};
            })
          } 
        },
        { provide: UsuarioService, useValue: {} }
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
