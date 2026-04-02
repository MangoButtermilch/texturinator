import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextureSettingsComponent } from './texture-settings.component';

describe('TextureSettingsComponent', () => {
  let component: TextureSettingsComponent;
  let fixture: ComponentFixture<TextureSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextureSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextureSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
