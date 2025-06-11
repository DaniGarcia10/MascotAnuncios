import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Database } from '@angular/fire/database';

import { MisanunciosDetailComponent } from './misanuncios-detail.component';

describe('MisanunciosDetailComponent', () => {
  let component: MisanunciosDetailComponent;
  let fixture: ComponentFixture<MisanunciosDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisanunciosDetailComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: Storage, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Database, useValue: {} } // <-- Añadido mock de Database
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisanunciosDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
