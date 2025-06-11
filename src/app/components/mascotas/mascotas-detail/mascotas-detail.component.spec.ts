import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Database } from '@angular/fire/database';

import { MascotasDetailComponent } from './mascotas-detail.component';

describe('MascotasDetailComponent', () => {
  let component: MascotasDetailComponent;
  let fixture: ComponentFixture<MascotasDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MascotasDetailComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { 
          provide: Auth, 
          useValue: { 
            onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.callFake(() => {}) 
          } 
        },
        { provide: Storage, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Database, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MascotasDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
