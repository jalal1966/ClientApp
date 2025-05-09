import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicDashboardComponent } from './clinic-dashboard.component';

describe('AppClinicDashboardComponent', () => {
  let component: ClinicDashboardComponent;
  let fixture: ComponentFixture<ClinicDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
