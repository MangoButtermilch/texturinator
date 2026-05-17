import { Component, OnInit } from '@angular/core';
import { SliderComponent } from '../../../../../shared/components/slider/slider.component';
import { CheckboxComponent } from '../../../../../shared/components/checkbox/checkbox.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Checkbox } from '../../../../../shared/components/checkbox/classes/checkbox.class';
import { Slider } from '../../../../../shared/components/slider/classes/slider.class';
import { UiFactoryService } from '../../../../../shared/services/ui-factory.service';
import { ShaderConfig } from '../../../../3d-volumes/interfaces/shader-configs.interfaces';
import { HeightmapGeneratorService } from '../../../services/heightmap-generator-service';

@Component({
  selector: 'app-normal-map-settings',
  imports: [
    SliderComponent,
    CheckboxComponent
  ],
  templateUrl: './normal-map-settings.component.html',
  styleUrl: './normal-map-settings.component.scss'
})
export class NormalMapSettingsComponent implements OnInit {


  public sliders: Slider[];
  public checkboxes: Checkbox[];

  constructor(
    private canvasService: HeightmapGeneratorService,
    private uiFactory: UiFactoryService
  ) { }

  ngOnInit(): void {

    this.sliders = [
      this.uiFactory.buildSlider("Strength", "strength", 1, -10.0, 10.0, 0.01),
    ];

  }

  public onSliderChange(slider: Slider): void {
    this.canvasService.updateShaderUniform(slider.uniformName, slider.value);
  }

  public onCheckboxChange(checkbox: Checkbox): void {
    this.canvasService.updateShaderUniform(checkbox.uniformName, checkbox.value);
  }

  private getSliderByUniformName(name: string): Slider | null {
    return this.sliders.find((other) => other.uniformName === name);
  }

  private getCheckboxByUniformName(name: string): Checkbox | null {
    return this.checkboxes.find((other) => other.uniformName === name);
  }
}
