import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Database } from '@angular/fire/database';

import { FavoritosListComponent } from './favoritos-list.component';

describe('FavoritosListComponent', () => {
  let component: FavoritosListComponent;
  let fixture: ComponentFixture<FavoritosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritosListComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: Storage, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Database, useValue: {} } // Mock para Database
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoritosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
