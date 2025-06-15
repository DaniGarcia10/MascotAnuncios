import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuscripcionesComponent } from './suscripciones.component';
import { SuscripcionesService } from '../../services/suscripciones.service';
import { of } from 'rxjs';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../../../environments/environment.testing';

// 👇 Mock del servicio
class MockSuscripcionesService {
  getSuscripciones = jasmine.createSpy().and.returnValue(of([]));
}

describe('SuscripcionesComponent', () => {
  let component: SuscripcionesComponent;
  let fixture: ComponentFixture<SuscripcionesComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(SuscripcionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    await TestBed.configureTestingModule({
      imports: [
        SuscripcionesComponent,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFirestore(() => getFirestore()),
      ],
    }).compileComponents();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
