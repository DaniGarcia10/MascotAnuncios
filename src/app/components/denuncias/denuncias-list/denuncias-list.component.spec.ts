import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenunciasListComponent } from './denuncias-list.component';

describe('DenunciasListComponent', () => {
  let component: DenunciasListComponent;
  let fixture: ComponentFixture<DenunciasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DenunciasListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DenunciasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
