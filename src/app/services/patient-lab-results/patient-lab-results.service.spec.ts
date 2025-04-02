import { TestBed } from '@angular/core/testing';

import { PatientLabResultsService } from './patient-lab-results.service';

describe('PatientLabResultsService', () => {
  let service: PatientLabResultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientLabResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
