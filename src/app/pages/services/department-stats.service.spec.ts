import { TestBed } from '@angular/core/testing';
import { DepartmentStatsService } from './department-stats.service';

describe('DepartmentStats', () => {
  let service: DepartmentStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepartmentStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
