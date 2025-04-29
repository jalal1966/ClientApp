import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionPrintComponent } from './prescription-print.component';

describe('PrescriptionPrintComponent', () => {
  let component: PrescriptionPrintComponent;
  let fixture: ComponentFixture<PrescriptionPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionPrintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrescriptionPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
