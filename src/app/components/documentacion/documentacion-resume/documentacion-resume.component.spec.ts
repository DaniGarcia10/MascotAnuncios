import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentacionResumeComponent } from './documentacion-resume.component';

describe('DocumentacionResumeComponent', () => {
  let component: DocumentacionResumeComponent;
  let fixture: ComponentFixture<DocumentacionResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentacionResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentacionResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
