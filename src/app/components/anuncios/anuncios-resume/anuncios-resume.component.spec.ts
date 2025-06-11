import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';

import { AnunciosResumeComponent } from './anuncios-resume.component';

describe('AnunciosResumeComponent', () => {
  let component: AnunciosResumeComponent;
  let fixture: ComponentFixture<AnunciosResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnunciosResumeComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: Storage, useValue: {} },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnunciosResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
