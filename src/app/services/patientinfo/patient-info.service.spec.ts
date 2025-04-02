import { TestBed } from '@angular/core/testing';

import { PatientInfoService } from './patient-info.service';

describe('PatientInfoService', () => {
  let service: PatientInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
