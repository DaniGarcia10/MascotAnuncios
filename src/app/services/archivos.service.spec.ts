import { TestBed } from '@angular/core/testing';
import { firebaseMocks } from '../../testing/mock-providers';

import { ArchivosService } from './archivos.service';

describe('ArchivosService', () => {
  let service: ArchivosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...firebaseMocks
      ],
    });
    service = TestBed.inject(ArchivosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
