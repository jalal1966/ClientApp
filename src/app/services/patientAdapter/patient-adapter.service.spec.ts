import { TestBed } from '@angular/core/testing';

import { PatientAdapterService } from './patient-adapter.service';

describe('PatientAdapterService', () => {
  let service: PatientAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientAdapterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
