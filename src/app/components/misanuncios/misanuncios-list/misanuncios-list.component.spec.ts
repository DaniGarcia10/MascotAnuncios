import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Database } from '@angular/fire/database';

import { MisanunciosListComponent } from './misanuncios-list.component';

describe('MisanunciosListComponent', () => {
  let component: MisanunciosListComponent;
  let fixture: ComponentFixture<MisanunciosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisanunciosListComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: Storage, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Database, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisanunciosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
