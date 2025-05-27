import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { criadorGuard } from './criador.guard';

describe('criadorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => criadorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
