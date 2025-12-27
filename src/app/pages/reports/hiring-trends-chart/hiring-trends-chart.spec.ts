import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HiringTrendsChart } from './hiring-trends-chart';

describe('HiringTrendsChart', () => {
  let component: HiringTrendsChart;
  let fixture: ComponentFixture<HiringTrendsChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HiringTrendsChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HiringTrendsChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
