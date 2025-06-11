import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Database } from '@angular/fire/database';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth.service'; // Importa la clase real
import { AnunciosService } from '../../../services/anuncios.service';
import { MascotasService } from '../../../services/mascotas.service';
import { SuscripcionesService } from '../../../services/suscripciones.service';
import { UsuarioService } from '../../../services/usuario.service';
import { DatosService } from '../../../services/datos.service';
import { ArchivosService } from '../../../services/archivos.service';
import { PlantillasService } from '../../../services/plantillas.service';

import { AnunciosFormComponent } from './anuncios-form.component';

describe('AnunciosFormComponent', () => {
  let component: AnunciosFormComponent;
  let fixture: ComponentFixture<AnunciosFormComponent>;

  // Mock de AuthService
  const mockAuthService = {
    getUserDataAuth: () => of({ user: { uid: 'test-uid' } })
  };

  // Mocks de servicios dependientes de Firestore
  const mockAnunciosService = {
    subirAnuncio: jasmine.createSpy('subirAnuncio').and.returnValue(Promise.resolve()),
    getTelefonoByIdUsuario: jasmine.createSpy('getTelefonoByIdUsuario').and.returnValue(Promise.resolve('666666666'))
  };
  const mockMascotasService = {
    getMascotas: jasmine.createSpy('getMascotas').and.returnValue(of([]))
  };
  const mockSuscripcionesService = {
    obtenerSuscripcion: jasmine.createSpy('obtenerSuscripcion').and.returnValue(of(null))
  };
  const mockUsuarioService = {
    getIdSuscripcionByUsuarioId: jasmine.createSpy('getIdSuscripcionByUsuarioId').and.returnValue(Promise.resolve(null))
  };
  const mockDatosService = {
    obtenerProvincias: jasmine.createSpy('obtenerProvincias').and.returnValue(Promise.resolve([])),
    obtenerRazas: jasmine.createSpy('obtenerRazas').and.returnValue(Promise.resolve([]))
  };
  const mockArchivosService = {
    cargarImagenes: jasmine.createSpy('cargarImagenes').and.returnValue(Promise.resolve([])),
    validarExtension: jasmine.createSpy('validarExtension').and.callFake(() => true)
  };
  const mockPlantillasService = {
    getPlantillaByUsuario: jasmine.createSpy('getPlantillaByUsuario').and.returnValue(of([]))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnunciosFormComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: Storage, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Database, useValue: {} },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AnunciosService, useValue: mockAnunciosService },
        { provide: MascotasService, useValue: mockMascotasService },
        { provide: SuscripcionesService, useValue: mockSuscripcionesService },
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: DatosService, useValue: mockDatosService },
        { provide: ArchivosService, useValue: mockArchivosService },
        { provide: PlantillasService, useValue: mockPlantillasService }
      ]
    })
    .overrideComponent(AnunciosFormComponent, {
      set: {
        providers: [
          { provide: AuthService, useValue: mockAuthService },
          { provide: AnunciosService, useValue: mockAnunciosService },
          { provide: MascotasService, useValue: mockMascotasService },
          { provide: SuscripcionesService, useValue: mockSuscripcionesService },
          { provide: UsuarioService, useValue: mockUsuarioService },
          { provide: DatosService, useValue: mockDatosService },
          { provide: ArchivosService, useValue: mockArchivosService },
          { provide: PlantillasService, useValue: mockPlantillasService }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnunciosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
