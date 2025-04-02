import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientVisitsComponent } from './patient-visits.component';

describe('PatientVisitsComponent', () => {
  let component: PatientVisitsComponent;
  let fixture: ComponentFixture<PatientVisitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientVisitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
