import { Component, OnInit } from '@angular/core';
import { Checkbox } from '../../../../../../shared/components/checkbox/classes/checkbox.class';
import { Slider } from '../../../../../../shared/components/slider/classes/slider.class';
import { UiFactoryService } from '../../../../../../shared/services/ui-factory.service';
import { TerrainHeightmapService } from '../../../../services/terrain-heightmap-service';
import { SliderComponent } from '../../../../../../shared/components/slider/slider.component';

@Component({
  selector: 'app-noise-settings',
  imports: [
    SliderComponent
  ],
  templateUrl: './noise-settings.component.html',
  styleUrl: './noise-settings.component.scss'
})
export class NoiseSettingsComponent implements OnInit {

  public sliders: Slider[];
  public checkboxes: Checkbox[];

  constructor(
    private canvasService: TerrainHeightmapService,
    private uiFactory: UiFactoryService
  ) { }

  ngOnInit(): void {
    this.sliders = [
      this.uiFactory.buildSlider("Erosion scale", "EROSION_SCALE", 0.15, 0, 1),
      this.uiFactory.buildSlider("Erosion strength", "EROSION_STRENGTH", 0.22, 0, 10),
      this.uiFactory.buildSlider("Erosion gully weight", "EROSION_GULLY_WEIGHT", 0.5, 0, 1),
      this.uiFactory.buildSlider("Erosion detail", "EROSION_DETAIL", 1.5, 0, 10),
      this.uiFactory.buildSlider("Ridge rounding", "ridgeRounding", 0.1, 0, 1),
      this.uiFactory.buildSlider("Crease rounding", "creaseRounding", 0.0, 0, 1),

      this.uiFactory.buildSlider("Erosion cell scale", "EROSION_CELL_SCALE", 0.7, 0, 1),
      this.uiFactory.buildSlider("Erosion normalization", "EROSION_NORMALIZATION", 0.5, 0, 1),
      this.uiFactory.buildSlider("Erosion octaves", "EROSION_OCTAVES", 5, 1, 20, 1),
      this.uiFactory.buildSlider("Erosion lacunarity", "EROSION_LACUNARITY", 2, 0, 10),
      this.uiFactory.buildSlider("Erosion gain", "EROSION_GAIN", 0.1, 0, 1),

    ];
  }

  public onSliderChange(slider: Slider): void {
    this.canvasService.updateShaderUniform(slider.uniformName, slider.value);
  }

  public onCheckboxChange(checkbox: Checkbox): void {
    this.canvasService.updateShaderUniform(checkbox.uniformName, checkbox.value);
  }
}
