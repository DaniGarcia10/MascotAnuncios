import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';

import { UsuariosResumeComponent } from './usuarios-resume.component';

describe('UsuariosResumeComponent', () => {
  let component: UsuariosResumeComponent;
  let fixture: ComponentFixture<UsuariosResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosResumeComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: Storage, useValue: {} },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
