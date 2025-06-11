import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Database } from '@angular/fire/database';

import { MisanunciosResumeComponent } from './misanuncios-resume.component';

describe('MisanunciosResumeComponent', () => {
  let component: MisanunciosResumeComponent;
  let fixture: ComponentFixture<MisanunciosResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisanunciosResumeComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: Storage, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Database, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisanunciosResumeComponent);
    component = fixture.componentInstance;

    // Mock de datos mínimos para evitar el error de 'id undefined'
    // Ajusta el nombre de la propiedad según lo que use el template, por ejemplo 'anuncio'
    (component as any).anuncio = {
      id: 'mock-id',
      titulo: 'Mock Título',
      descripcion: 'Mock descripción',
      // Agrega aquí cualquier otra propiedad que el template utilice
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
