import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { Storage } from '@angular/fire/storage';
import { Database } from '@angular/fire/database';
import { Firestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  const authServiceMock = {
    isAuthenticated: () => of(true),
    getUserDataAuth: () => of({ usuario: { vendedor: false, email: '' } }),
    getUsuarioId: () => 'mockUserId',
    logout: () => Promise.resolve()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Auth, useValue: {} },
        { provide: Storage, useValue: {} }, // Mock Storage provider agregado
        { provide: Database, useValue: {} }, // Mock Database provider agregado
        { provide: Firestore, useValue: {} }, // Mock Firestore provider agregado
        { provide: ActivatedRoute, useValue: {} } // Mock ActivatedRoute provider agregado
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
