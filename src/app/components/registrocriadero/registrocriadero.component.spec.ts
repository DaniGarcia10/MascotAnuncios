import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrocriaderoComponent } from './registrocriadero.component';

describe('RegistrocriaderoComponent', () => {
  let component: RegistrocriaderoComponent;
  let fixture: ComponentFixture<RegistrocriaderoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrocriaderoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrocriaderoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
