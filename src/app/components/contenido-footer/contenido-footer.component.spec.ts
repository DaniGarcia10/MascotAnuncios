import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenidoFooterComponent } from './contenido-footer.component';

describe('ContenidoFooterComponent', () => {
  let component: ContenidoFooterComponent;
  let fixture: ComponentFixture<ContenidoFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContenidoFooterComponent]
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
