import { TestBed } from '@angular/core/testing';

import { PatientVisitsService } from './patient-visits.service';

describe('PatientVisitsService', () => {
  let service: PatientVisitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientVisitsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
