import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnunciosFormComponent } from './anuncios-form.component';

describe('AnunciosFormComponent', () => {
  let component: AnunciosFormComponent;
  let fixture: ComponentFixture<AnunciosFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnunciosFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnunciosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
