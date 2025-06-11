import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { CriaderoService } from './criadero.service';
import { firebaseMocks } from '../../testing/mock-providers';

describe('CriaderoService', () => {
  let service: CriaderoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...firebaseMocks
      ],
    });
    service = TestBed.inject(CriaderoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
