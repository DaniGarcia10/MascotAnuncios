import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Database } from '@angular/fire/database';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SuscripcionesComponent } from './suscripciones.component';
import { SuscripcionesService } from '../../services/suscripciones.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';

describe('SuscripcionesComponent', () => {
  let component: SuscripcionesComponent;
  let fixture: ComponentFixture<SuscripcionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuscripcionesComponent, HttpClientTestingModule],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: Storage, useValue: {} },
        { provide: Database, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} }, queryParams: of({}) }
        },
        {
          provide: Auth,
          useValue: {
            onAuthStateChanged: jasmine.createSpy().and.callFake((cb: any) => {
              cb({ uid: 'test-user-id' });
              return () => {};
            })
          }
        },
        {
          provide: SuscripcionesService,
          useValue: {
            obtenerSuscripcion: jasmine.createSpy('obtenerSuscripcion').and.returnValue(
              of({
                id: 'sus1',
                fecha_alta: '2025-06-01T00:00:00.000Z',
                fecha_fin: '2025-12-31T00:00:00.000Z'
              })
            ),
            crearSuscripcion: jasmine.createSpy('crearSuscripcion').and.resolveTo('sus1'),
            actualizarSuscripcion: jasmine.createSpy('actualizarSuscripcion').and.resolveTo()
          }
        },
        {
          provide: AuthService,
          useValue: {
            getUserDataAuth: jasmine.createSpy('getUserDataAuth').and.returnValue(
              of({ user: { uid: 'test-user-id' } })
            )
          }
        },
        {
          provide: UsuarioService,
          useValue: {
            getUsuarioById: jasmine.createSpy('getUsuarioById').and.callFake(() =>
              Promise.resolve({ suscripcion: 'sus1' })
            ),
            actualizarUsuario: jasmine.createSpy('actualizarUsuario').and.resolveTo()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SuscripcionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Ejecuta ngOnInit()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
