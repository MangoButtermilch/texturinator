import { TestBed } from '@angular/core/testing';

import { VolumePreviewService } from './volume-preview.service';

describe('VolumePreviewService', () => {
  let service: VolumePreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VolumePreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
