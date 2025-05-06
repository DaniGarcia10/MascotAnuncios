import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisanunciosDetailComponent } from './misanuncios-detail.component';

describe('MisanunciosDetailComponent', () => {
  let component: MisanunciosDetailComponent;
  let fixture: ComponentFixture<MisanunciosDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisanunciosDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisanunciosDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
