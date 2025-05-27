import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { noCriaderoGuard } from './no-criadero.guard';

describe('noCriaderoGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => noCriaderoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
