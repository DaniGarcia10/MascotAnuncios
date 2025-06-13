import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenunciasResumeComponent } from './denuncias-resume.component';

describe('DenunciasResumeComponent', () => {
  let component: DenunciasResumeComponent;
  let fixture: ComponentFixture<DenunciasResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DenunciasResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DenunciasResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
