import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Database } from '@angular/fire/database';
import { of } from 'rxjs';

import { MascotasListComponent } from './mascotas-list.component';
import { AuthService } from '../../../services/auth.service';

describe('MascotasListComponent', () => {
  let component: MascotasListComponent;
  let fixture: ComponentFixture<MascotasListComponent>;

  // Mock para AuthService
  const mockAuthService = {
    getUserDataAuth: () => of({ user: { uid: 'test-uid' } })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MascotasListComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: Storage, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Database, useValue: {} },
        { provide: 'AuthService', useValue: mockAuthService }, // Si usas inyección por string token
        { provide: AuthService, useValue: mockAuthService } // Usa la clase importada
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MascotasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
