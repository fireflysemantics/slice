import { TestBed } from '@angular/core/testing';

import { SliceService } from './slice.service';

describe('SliceService', () => {
  let service: SliceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SliceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
