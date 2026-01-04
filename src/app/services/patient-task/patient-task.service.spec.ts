import { TestBed } from '@angular/core/testing';

import { PatientTaskService } from './patient-task.service';

describe('PatientTaskService', () => {
  let service: PatientTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
