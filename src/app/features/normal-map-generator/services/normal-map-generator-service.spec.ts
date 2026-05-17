import { TestBed } from '@angular/core/testing';

import { NormalMapGeneratorService } from './normal-map-generator-service';

describe('NormalMapGeneratorService', () => {
  let service: NormalMapGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NormalMapGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
