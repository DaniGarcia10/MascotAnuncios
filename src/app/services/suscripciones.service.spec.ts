import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { SuscripcionesService } from './suscripciones.service';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

describe('SuscripcionesService', () => {
  let service: SuscripcionesService;

  beforeEach(() => {
    // Solo inicializa si no existe ya una app
    const firebaseConfig = { apiKey: 'fake', projectId: 'test' };

    if (getApps().length === 0) {
      initializeApp(firebaseConfig);
    }

    const firestoreInstance = getFirestore();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Firestore,
          useValue: { _delegate: firestoreInstance }
        }
      ]
    });

    service = TestBed.inject(SuscripcionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
