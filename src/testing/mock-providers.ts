import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { Database } from '@angular/fire/database';
import { ActivatedRoute } from '@angular/router';

export const firebaseMocks = [
  { provide: Firestore, useValue: {} },
  { provide: Auth, useValue: {} },
  { provide: Storage, useValue: {} },
  { provide: Database, useValue: {} }
];

export const activatedRouteMock = {
  provide: ActivatedRoute,
  useValue: {
    queryParams: { subscribe: () => {} },
    snapshot: {
      paramMap: {
        get: () => null
      }
    }
  }
};
