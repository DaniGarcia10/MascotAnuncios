import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { ArchivosService } from '../../services/archivos.service';
import { DocumentacionService } from '../../services/documentacion.service';
import { UsuarioService } from '../../services/usuario.service';

import { RegistrocriaderoComponent } from './registrocriadero.component';

describe('RegistrocriaderoComponent', () => {
  let component: RegistrocriaderoComponent;
  let fixture: ComponentFixture<RegistrocriaderoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrocriaderoComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: AuthService, useValue: {} },
        { provide: ArchivosService, useValue: {} },
        { provide: DocumentacionService, useValue: {} },
        { provide: UsuarioService, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrocriaderoComponent);
    component = fixture.componentInstance;
    // Inicializa datos mínimos si es necesario
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
