import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisanunciosResumeComponent } from './misanuncios-resume.component';

describe('MisanunciosResumeComponent', () => {
  let component: MisanunciosResumeComponent;
  let fixture: ComponentFixture<MisanunciosResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisanunciosResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisanunciosResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
