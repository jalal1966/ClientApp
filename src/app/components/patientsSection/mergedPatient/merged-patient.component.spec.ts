import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergedPatientComponent } from './merged-patient.component';

describe('MergedPatientComponent', () => {
  let component: MergedPatientComponent;
  let fixture: ComponentFixture<MergedPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MergedPatientComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MergedPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
