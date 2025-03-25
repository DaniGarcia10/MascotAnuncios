import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnunciosDetailComponent } from './anuncios-detail.component';

describe('AnunciosDetailComponent', () => {
  let component: AnunciosDetailComponent;
  let fixture: ComponentFixture<AnunciosDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnunciosDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnunciosDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
