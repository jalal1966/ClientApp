import { TestBed } from '@angular/core/testing';

import { PatientMedicationsService } from './patient-medications.service';

describe('PatientMedicationsService', () => {
  let service: PatientMedicationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientMedicationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
