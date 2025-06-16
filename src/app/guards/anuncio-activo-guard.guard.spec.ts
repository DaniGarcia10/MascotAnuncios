import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { anuncioActivoGuardGuard } from './anuncio-activo-guard.guard';

describe('anuncioActivoGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => anuncioActivoGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
