import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import { ArchivosService } from '../../../services/archivos.service';
import { MascotasService } from '../../../services/mascotas.service';
import { CriaderoService } from '../../../services/criadero.service';
import { UsuarioService } from '../../../services/usuario.service';
import { CachorrosService } from '../../../services/cachorros.service';
import { FavoritosService } from '../../../services/favoritos.service';
import { AuthService } from '../../../services/auth.service';
import { of } from 'rxjs';

import { AnunciosDetailComponent } from './anuncios-detail.component';

describe('AnunciosDetailComponent', () => {
  let component: AnunciosDetailComponent;
  let fixture: ComponentFixture<AnunciosDetailComponent>;

  const mockUsuarioService = {
    getUsuarioById: jasmine.createSpy().and.returnValue(Promise.resolve({
      id: 'usuario-test-id',
      nombre: 'Test User',
      id_criadero: 'criadero-test-id'
    })),
    getIdCriaderoByUsuarioId: jasmine.createSpy().and.returnValue(Promise.resolve('criadero-test-id'))
  };

  const mockCriaderoService = {
    getCriaderoById: jasmine.createSpy().and.returnValue(Promise.resolve({
      id: 'criadero-test-id',
      nombre: 'Criadero Test',
      foto_perfil: 'foto.jpg'
    }))
  };

  const mockArchivosService = {
    cargarImagenes: jasmine.createSpy().and.callFake((rutas: string[]) =>
      Promise.resolve(rutas.map(r => `https://fakeurl.com/${r}`)),
    ),
    obtenerUrlImagen: jasmine.createSpy().and.callFake((ruta: string) =>
      Promise.resolve(`https://fakeurl.com/${ruta}`)
    )
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnunciosDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'test-id' }),
            snapshot: { paramMap: { get: () => 'test-id' } }
          }
        },
        { provide: Firestore, useValue: {} },
        { provide: Database, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: ArchivosService, useValue: mockArchivosService },
        { provide: MascotasService, useValue: { getMascotaByIdAndUsuario: () => Promise.resolve({ imagenes: ['img1.jpg'] }) } },
        { provide: CriaderoService, useValue: mockCriaderoService },
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: CachorrosService, useValue: { getCachorrosByAnuncioId: () => Promise.resolve([]) } },
        { provide: FavoritosService, useValue: { getFavoritosIds: () => of([]) } },
        { provide: AuthService, useValue: { getUsuarioId: () => 'usuario-test-id' } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnunciosDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
