import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalMapSettingsComponent } from './normal-map-settings.component';

describe('NormalMapSettingsComponent', () => {
  let component: NormalMapSettingsComponent;
  let fixture: ComponentFixture<NormalMapSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NormalMapSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NormalMapSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
