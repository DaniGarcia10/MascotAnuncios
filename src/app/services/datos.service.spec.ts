import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { DatosService } from './datos.service';
import { firebaseMocks } from '../../testing/mock-providers';

describe('DatosService', () => {
  let service: DatosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...firebaseMocks
      ],
    });
    service = TestBed.inject(DatosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
