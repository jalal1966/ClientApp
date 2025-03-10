import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursepageComponent } from './nursepage.component';

describe('NursepageComponent', () => {
  let component: NursepageComponent;
  let fixture: ComponentFixture<NursepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NursepageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
