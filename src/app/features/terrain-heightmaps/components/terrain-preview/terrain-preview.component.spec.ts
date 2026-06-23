import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerrainPreviewComponent } from './terrain-preview.component';

describe('TerrainPreviewComponent', () => {
  let component: TerrainPreviewComponent;
  let fixture: ComponentFixture<TerrainPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerrainPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerrainPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
