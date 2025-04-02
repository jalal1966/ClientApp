import { TestBed } from '@angular/core/testing';

import { PatientAllergiesService } from './patient-allergies.service';

describe('PatientAllergiesService', () => {
  let service: PatientAllergiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientAllergiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
