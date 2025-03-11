import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursePageComponent } from './nurse-page.component';

describe('NursepageComponent', () => {
  let component: NursePageComponent;
  let fixture: ComponentFixture<NursePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NursePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NursePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
