import { TestBed } from '@angular/core/testing';
import { FavoritosService } from './favoritos.service';
import { firebaseMocks } from '../../testing/mock-providers';
import { Auth } from '@angular/fire/auth';

describe('FavoritosService', () => {
  let service: FavoritosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...firebaseMocks,
        { provide: Auth, useValue: { onAuthStateChanged: () => {} } }
      ],
    });
    service = TestBed.inject(FavoritosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
