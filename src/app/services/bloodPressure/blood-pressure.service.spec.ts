import { TestBed } from '@angular/core/testing';

import { BloodPressureService } from './blood-pressure.service';

describe('BloodPressureService', () => {
  let service: BloodPressureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BloodPressureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
