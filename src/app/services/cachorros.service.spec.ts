import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { CachorrosService } from './cachorros.service';
import { firebaseMocks } from '../../testing/mock-providers';

describe('CachorrosService', () => {
  let service: CachorrosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...firebaseMocks
      ],
    });
    service = TestBed.inject(CachorrosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
