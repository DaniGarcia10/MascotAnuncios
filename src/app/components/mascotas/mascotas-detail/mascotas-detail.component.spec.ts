import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MascotasDetailComponent } from './mascotas-detail.component';

describe('MascotasDetailComponent', () => {
  let component: MascotasDetailComponent;
  let fixture: ComponentFixture<MascotasDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MascotasDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MascotasDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
