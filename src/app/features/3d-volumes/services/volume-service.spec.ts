import { TestBed } from '@angular/core/testing';

import { VolumeService } from './volume-service';

describe('VolumeService', () => {
  let service: VolumeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VolumeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
