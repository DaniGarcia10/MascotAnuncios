import { TestBed } from '@angular/core/testing';
import { MascotasService } from './mascotas.service';
import { firebaseMocks } from '../../testing/mock-providers';

describe('MascotasService', () => {
  let service: MascotasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...firebaseMocks
      ],
    });
    service = TestBed.inject(MascotasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
