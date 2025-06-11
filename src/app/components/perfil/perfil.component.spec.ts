import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { UsuarioService } from '../../services/usuario.service';
import { CriaderoService } from '../../services/criadero.service';
import { ArchivosService } from '../../services/archivos.service';
import { DocumentacionService } from '../../services/documentacion.service';

import { PerfilComponent } from './perfil.component';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [
        { 
          provide: Auth, 
          useValue: { 
            onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.callFake((cb: any) => { 
              // Simula un usuario autenticado o null según lo que necesites
              cb(null); 
              return () => {}; // función de desuscripción mock
            }) 
          } 
        },
        { provide: Firestore, useValue: {} },
        { provide: UsuarioService, useValue: {} },
        { provide: CriaderoService, useValue: {} },
        { provide: ArchivosService, useValue: {} },
        { provide: DocumentacionService, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
