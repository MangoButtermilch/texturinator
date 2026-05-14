import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalMapGeneratorViewComponent } from './normal-map-generator-view.component';

describe('NormalMapGeneratorViewComponent', () => {
  let component: NormalMapGeneratorViewComponent;
  let fixture: ComponentFixture<NormalMapGeneratorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NormalMapGeneratorViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NormalMapGeneratorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
