import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';

import { DocumentacionResumeComponent } from './documentacion-resume.component';

describe('DocumentacionResumeComponent', () => {
  let component: DocumentacionResumeComponent;
  let fixture: ComponentFixture<DocumentacionResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentacionResumeComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: Storage, useValue: {} },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentacionResumeComponent);
    component = fixture.componentInstance;
    // Inicializar el input para evitar el error
    component.usuario = { usuario: {} as any, documentacion: {} as any };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
