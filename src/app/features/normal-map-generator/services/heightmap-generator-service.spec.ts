import { TestBed } from '@angular/core/testing';

import { HeightmapGeneratorService } from './heightmap-generator-service';

describe('HeightmapGeneratorService', () => {
  let service: HeightmapGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeightmapGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
