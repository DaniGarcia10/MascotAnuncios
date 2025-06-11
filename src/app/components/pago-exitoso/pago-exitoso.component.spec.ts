import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { SuscripcionesService } from '../../services/suscripciones.service';
import { Firestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PagoExitosoComponent } from './pago-exitoso.component';

describe('PagoExitosoComponent', () => {
  let component: PagoExitosoComponent;
  let fixture: ComponentFixture<PagoExitosoComponent>;

  const mockUsuarioService = {
    getUsuarioById: jasmine.createSpy().and.returnValue(Promise.resolve({
      id: 'test-uid',
      nombre: 'Usuario Test',
      suscripcion: null
    })),
    actualizarUsuario: jasmine.createSpy().and.returnValue(Promise.resolve())
  };

  const mockSuscripcionesService = {
    crearSuscripcion: jasmine.createSpy().and.returnValue(Promise.resolve('id-suscripcion-test')),
    obtenerSuscripcion: jasmine.createSpy().and.returnValue(of(null)), // si quieres simular renovación, devuelve un objeto
    actualizarSuscripcion: jasmine.createSpy().and.returnValue(Promise.resolve())
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoExitosoComponent],
      providers: [
        { provide: AuthService, useValue: { getUserDataAuth: () => of({ user: { uid: 'test-uid' } }) } },
        { provide: Auth, useValue: {} },
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: SuscripcionesService, useValue: mockSuscripcionesService },
        { provide: Firestore, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'duracion' ? '30' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PagoExitosoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
