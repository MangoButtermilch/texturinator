import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoiseLayerComponent } from './noise-layer.component';

describe('NoiseLayerComponent', () => {
  let component: NoiseLayerComponent;
  let fixture: ComponentFixture<NoiseLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoiseLayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoiseLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
