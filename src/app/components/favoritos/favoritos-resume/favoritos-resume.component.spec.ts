import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Database } from '@angular/fire/database';

import { FavoritosResumeComponent } from './favoritos-resume.component';

describe('FavoritosResumeComponent', () => {
  let component: FavoritosResumeComponent;
  let fixture: ComponentFixture<FavoritosResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritosResumeComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: Storage, useValue: {} },
        { provide: ActivatedRoute, useValue: { paramMap: { get: () => null }, snapshot: { paramMap: { get: () => null } } } },
        { provide: Database, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoritosResumeComponent);
    component = fixture.componentInstance;
    // Inicializa datos mínimos para evitar errores de undefined
    component.anuncio = { imagenes: [], fecha_publicacion: new Date(), titulo: '', precio: 0, raza: '', ubicacion: '' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
