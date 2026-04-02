import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumePreviewComponent } from './volume-preview.component';

describe('VolumePreviewComponent', () => {
  let component: VolumePreviewComponent;
  let fixture: ComponentFixture<VolumePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolumePreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolumePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
