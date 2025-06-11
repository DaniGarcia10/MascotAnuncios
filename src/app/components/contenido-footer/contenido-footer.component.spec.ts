import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ContenidoFooterComponent } from './contenido-footer.component';

describe('ContenidoFooterComponent', () => {
  let component: ContenidoFooterComponent;
  let fixture: ComponentFixture<ContenidoFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContenidoFooterComponent],
      providers: [
        { 
          provide: ActivatedRoute, 
          useValue: { 
            params: of({}),
            fragment: of('criadores') // Mock de fragment como observable
          } 
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContenidoFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
