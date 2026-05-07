import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerrainGeneratorViewComponent } from './terrain-generator-view.component';

describe('TerrainGeneratorViewComponent', () => {
  let component: TerrainGeneratorViewComponent;
  let fixture: ComponentFixture<TerrainGeneratorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerrainGeneratorViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerrainGeneratorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
