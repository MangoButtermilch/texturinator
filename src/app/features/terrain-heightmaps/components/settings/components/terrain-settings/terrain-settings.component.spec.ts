import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerrainSettingsComponent } from './terrain-settings.component';

describe('TerrainSettingsComponent', () => {
  let component: TerrainSettingsComponent;
  let fixture: ComponentFixture<TerrainSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerrainSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerrainSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
