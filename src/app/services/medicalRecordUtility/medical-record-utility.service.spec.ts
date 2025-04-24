import { TestBed } from '@angular/core/testing';

import { MedicalRecordUtilityService } from './medical-record-utility.service';

describe('MedicalRecordUtilityService', () => {
  let service: MedicalRecordUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicalRecordUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
