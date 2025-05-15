import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritosResumeComponent } from './favoritos-resume.component';

describe('FavoritosResumeComponent', () => {
  let component: FavoritosResumeComponent;
  let fixture: ComponentFixture<FavoritosResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritosResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoritosResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
