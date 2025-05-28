import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosResumeComponent } from './usuarios-resume.component';

describe('UsuariosResumeComponent', () => {
  let component: UsuariosResumeComponent;
  let fixture: ComponentFixture<UsuariosResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
