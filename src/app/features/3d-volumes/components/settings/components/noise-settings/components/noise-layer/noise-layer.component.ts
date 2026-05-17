import { Component, Input, OnInit } from '@angular/core';
import { CheckboxComponent } from '../../../../../../../../shared/components/checkbox/checkbox.component';
import { Checkbox } from '../../../../../../../../shared/components/checkbox/classes/checkbox.class';
import { Dropdown } from '../../../../../../../../shared/components/dropdown/classes/dropdown.class';
import { DropdownComponent } from '../../../../../../../../shared/components/dropdown/dropdown.component';
import { Slider } from '../../../../../../../../shared/components/slider/classes/slider.class';
import { SliderComponent } from '../../../../../../../../shared/components/slider/slider.component';
import { NoiseLayer, NoiseType } from '../../../../../../interfaces/shader-configs.interfaces';
import { UiFactoryService } from '../../../../../../../../shared/services/ui-factory.service';
import { VolumeService } from '../../../../../../services/volume-service';


@Component({
  selector: 'app-noise-layer',
  imports: [SliderComponent, DropdownComponent, CheckboxComponent],
  templateUrl: './noise-layer.component.html',
  styleUrl: './noise-layer.component.scss'
})
export class NoiseLayerComponent implements OnInit {

  @Input() config: NoiseLayer;

  public scaleSlider: Slider;
  public powerSlider: Slider;
  public distortionSlider: Slider;
  public angleOffsetSlider: Slider;

  public invertCheckbox: Checkbox;
  public enabledCheckbox: Checkbox;

  public noiseTypeDropdown: Dropdown;

  constructor(
    private uiFactory: UiFactoryService,
    private canvasService: VolumeService
  ) { }

  ngOnInit(): void {

    this.scaleSlider = this.uiFactory.buildSlider("Scale", "scale", this.config.scale, 0, 10);
    this.powerSlider = this.uiFactory.buildSlider("Power", "power", this.config.power, 0, 10);
    this.distortionSlider = this.uiFactory.buildSlider("Distortion", "distortion", this.config.distortion, 0, 100);
    this.angleOffsetSlider = this.uiFactory.buildSlider("Angle offset", "angleOffset", this.config.angleOffset, 0, 100);

    this.noiseTypeDropdown = this.uiFactory.buildDropdown(
      "Noise type",
      "noiseType",
      this.config.noiseType,
      [
        { label: "Perlin noise", value: NoiseType.PERLIN },
        { label: "Simplex noise", value: NoiseType.SIMPLEX },
        { label: "Voronoi noise", value: NoiseType.VORONOI },
        { label: "Nebula noise", value: NoiseType.NEBULA },
      ]
    );

    this.invertCheckbox = this.uiFactory.buildCheckbox("Inverted", "inverted");
    this.enabledCheckbox = this.uiFactory.buildCheckbox("Enabled", "enabled", this.config.enabled);
  }

  public onInputChange(input: Slider | Dropdown | Checkbox): void {
    if (!input || !input.uniformName) {
      console.warn("Invalid input.");
      return;
    }

    if (this.config[input.uniformName] !== undefined) {
      this.config[input.uniformName] = input.value;

      this.canvasService.onNoiseLayerChange(this.config);
    } else {
      console.warn("Uniform not defined in noise layer: " + input.uniformName);
    }
  }

}
