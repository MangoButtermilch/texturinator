import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeGeneratorViewComponent } from './volume-generator-view.component';

describe('VolumeGeneratorViewComponent', () => {
  let component: VolumeGeneratorViewComponent;
  let fixture: ComponentFixture<VolumeGeneratorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolumeGeneratorViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolumeGeneratorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
