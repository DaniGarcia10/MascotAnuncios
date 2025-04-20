import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MascotasResumeComponent } from './mascotas-resume.component';

describe('MascotasResumeComponent', () => {
  let component: MascotasResumeComponent;
  let fixture: ComponentFixture<MascotasResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MascotasResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MascotasResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
