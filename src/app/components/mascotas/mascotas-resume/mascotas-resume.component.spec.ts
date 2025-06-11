import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MascotasResumeComponent } from './mascotas-resume.component';
import { Firestore } from 'firebase/firestore';
import { Auth } from '@angular/fire/auth';
import { MascotasService } from '../../../services/mascotas.service';
import { ArchivosService } from '../../../services/archivos.service';

// Clases mock explícitas
class MascotasServiceMock {
  getMascotaById = jasmine.createSpy('getMascotaById').and.returnValue(Promise.resolve({}));
}
class ArchivosServiceMock {
  cargarImagenes = jasmine.createSpy('cargarImagenes').and.returnValue(Promise.resolve(['mock-url']));
}

// Mock para Auth
class AuthMock {
  currentUser = { uid: 'test-uid' };
}

describe('MascotasResumeComponent', () => {
  let component: MascotasResumeComponent;
  let fixture: ComponentFixture<MascotasResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MascotasResumeComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: MascotasService, useClass: MascotasServiceMock },
        { provide: ArchivosService, useClass: ArchivosServiceMock },
        { provide: Auth, useClass: AuthMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MascotasResumeComponent);
    component = fixture.componentInstance;
    // Asignar un objeto de prueba a mascota antes de detectar cambios
    component.mascota = {
      id: '1',
      nombre: 'Firulais',
      imagenes: ['img1.jpg'],
      id_padre: '',
      id_madre: ''
      // ...agrega otras propiedades requeridas por el modelo Mascota si es necesario...
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
