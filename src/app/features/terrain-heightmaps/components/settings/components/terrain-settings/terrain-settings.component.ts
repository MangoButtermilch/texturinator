import { Component, OnInit } from '@angular/core';
import { Checkbox } from '../../../../../../shared/components/checkbox/classes/checkbox.class';
import { Slider } from '../../../../../../shared/components/slider/classes/slider.class';
import { UiFactoryService } from '../../../../../../shared/services/ui-factory.service';
import { CanvasService } from '../../../../services/canvas.service';
import { SliderComponent } from '../../../../../../shared/components/slider/slider.component';

@Component({
  selector: 'app-terrain-settings',
  imports: [
    SliderComponent
  ],
  templateUrl: './terrain-settings.component.html',
  styleUrl: './terrain-settings.component.scss'
})
export class TerrainSettingsComponent implements OnInit {
 
  public sliders: Slider[];
  public checkboxes: Checkbox[];

  constructor(
    private canvasService: CanvasService,
    private uiFactory: UiFactoryService
  ) { }


  ngOnInit(): void {
    this.sliders = [
      this.uiFactory.buildSlider("Height frequency", "HEIGHT_FREQUENCY", 3.0, 0, 10),
      this.uiFactory.buildSlider("Height amplitude", "HEIGHT_AMP", 0.125, 0, 1),
      this.uiFactory.buildSlider("Height octaves", "HEIGHT_OCTAVES", 1, 1, 5, 1),
      this.uiFactory.buildSlider("Height lacunarity", "HEIGHT_LACUNARITY", 2.0, 1, 10),
      this.uiFactory.buildSlider("Height gain", "HEIGHT_GAIN", 0.1, 0, 1),
    ];
  }

  public onSliderChange(slider: Slider): void {
    this.canvasService.updateShaderUniform(slider.uniformName, slider.value);
  }

  public onCheckboxChange(checkbox: Checkbox): void {
    this.canvasService.updateShaderUniform(checkbox.uniformName, checkbox.value);
  }
}