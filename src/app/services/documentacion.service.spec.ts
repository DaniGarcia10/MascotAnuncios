import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { DocumentacionService } from './documentacion.service';
import { firebaseMocks } from '../../testing/mock-providers';

describe('DocumentacionService', () => {
  let service: DocumentacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...firebaseMocks
      ],
    });
    service = TestBed.inject(DocumentacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
