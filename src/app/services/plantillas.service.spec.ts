import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { PlantillasService } from './plantillas.service';

describe('PlantillasService', () => {
  let service: PlantillasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: {} },
      ],
    });
    service = TestBed.inject(PlantillasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
