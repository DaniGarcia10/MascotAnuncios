import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnunciosResumeComponent } from './anuncios-resume.component';

describe('AnunciosResumeComponent', () => {
  let component: AnunciosResumeComponent;
  let fixture: ComponentFixture<AnunciosResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnunciosResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnunciosResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
