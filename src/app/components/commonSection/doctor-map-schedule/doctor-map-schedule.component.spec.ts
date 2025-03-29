import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorMapScheduleComponent } from './doctor-map-schedule.component';

describe('DoctorMapScheduleComponent', () => {
  let component: DoctorMapScheduleComponent;
  let fixture: ComponentFixture<DoctorMapScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorMapScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorMapScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
