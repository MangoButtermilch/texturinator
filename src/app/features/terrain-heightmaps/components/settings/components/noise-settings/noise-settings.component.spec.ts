import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoiseSettingsComponent } from './noise-settings.component';

describe('NoiseSettingsComponent', () => {
  let component: NoiseSettingsComponent;
  let fixture: ComponentFixture<NoiseSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoiseSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoiseSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
