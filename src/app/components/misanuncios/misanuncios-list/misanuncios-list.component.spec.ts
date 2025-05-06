import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisanunciosListComponent } from './misanuncios-list.component';

describe('MisanunciosListComponent', () => {
  let component: MisanunciosListComponent;
  let fixture: ComponentFixture<MisanunciosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisanunciosListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisanunciosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
