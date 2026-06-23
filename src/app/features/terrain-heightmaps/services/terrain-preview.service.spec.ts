import { TestBed } from '@angular/core/testing';

import { TerrainPreviewService } from './terrain-preview.service';

describe('TerrainPreviewService', () => {
  let service: TerrainPreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TerrainPreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
