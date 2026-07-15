import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StaffManager } from './staff-manager';

describe('StaffManager', () => {
  let service: StaffManager;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(StaffManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});