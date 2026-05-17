import { TestBed } from '@angular/core/testing';

import { TerrainHeightmapService } from './terrain-heightmap-service';

describe('TerrainHeightmapService', () => {
  let service: TerrainHeightmapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TerrainHeightmapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
