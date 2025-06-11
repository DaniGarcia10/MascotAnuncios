import { TestBed } from '@angular/core/testing';
import { AnunciosService } from './anuncios.service';
import { Auth } from '@angular/fire/auth';
import { firebaseMocks } from '../../testing/mock-providers';

describe('AnunciosService', () => {
  let service: AnunciosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...firebaseMocks,
        { provide: Auth, useValue: { currentUser: { uid: 'test-uid' } } }
      ],
    });
    service = TestBed.inject(AnunciosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
