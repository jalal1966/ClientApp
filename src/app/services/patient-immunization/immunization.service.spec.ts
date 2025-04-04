import { TestBed } from '@angular/core/testing';

import { ImmunizationService } from './immunization.service';

describe('ImmunizationService', () => {
  let service: ImmunizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImmunizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
