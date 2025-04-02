import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAllergiesComponent } from './patient-allergies.component';

describe('PatientAllergiesComponent', () => {
  let component: PatientAllergiesComponent;
  let fixture: ComponentFixture<PatientAllergiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientAllergiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientAllergiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
