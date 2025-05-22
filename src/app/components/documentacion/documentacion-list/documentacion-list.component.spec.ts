import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentacionListComponent } from './documentacion-list.component';

describe('DocumentacionListComponent', () => {
  let component: DocumentacionListComponent;
  let fixture: ComponentFixture<DocumentacionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentacionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentacionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
