import { Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { CheckboxComponent } from '../../../../../../shared/components/checkbox/checkbox.component';
import { Checkbox } from '../../../../../../shared/components/checkbox/classes/checkbox.class';
import { Slider } from '../../../../../../shared/components/slider/classes/slider.class';
import { SliderComponent } from '../../../../../../shared/components/slider/slider.component';
import { ShaderConfig } from '../../../../interfaces/shader-configs.interfaces';
import { UiFactoryService } from '../../../../../../shared/services/ui-factory.service';
import { CanvasService } from '../../../../services/canvas.service';

@Component({
  selector: 'app-main-settings',
  imports: [SliderComponent, CheckboxComponent],
  templateUrl: './main-settings.component.html',
  styleUrl: './main-settings.component.scss'
})
export class MainSettingsComponent implements OnInit {

  public sliders: Slider[];
  public checkboxes: Checkbox[];

  private shaderUvConfig$: Observable<ShaderConfig> = this.canvasService.getShaderConfig()
    .pipe(takeUntilDestroyed()); 

  constructor(
    private canvasService: CanvasService,
    private uiFactory: UiFactoryService
  ) { }

  ngOnInit(): void {

    this.sliders = [
      this.uiFactory.buildSlider("Depth (z position offset", "depth", 0, -100, 100),
      this.uiFactory.buildSlider("Center radius", "centerRadius"),
      this.uiFactory.buildSlider("Center strength", "centerStrength"),
      this.uiFactory.buildSlider("Border strength", "borderStrength"),
      this.uiFactory.buildSlider("Total brightness", "totalBrightness"),
      this.uiFactory.buildSlider("Amount of cells", "numCells", 1, 1, 32, 1),
    ];

    this.checkboxes = [
      this.uiFactory.buildCheckbox("Hide first cell", "hideFirstCell"),
      this.uiFactory.buildCheckbox("Hide last cell", "hideLastCell"),
      this.uiFactory.buildCheckbox("Grow and shrink cells", "growAndShrinkCells")
    ];

    this.handleUvConfigChanges();
  }

  private handleUvConfigChanges(): void {
    this.shaderUvConfig$.subscribe((config: ShaderConfig) => {
      for (const [name, value] of Object.entries(config)) {

        const slider = this.getSliderByUniformName(name);
        const checkbox = this.getCheckboxByUniformName(name);

        if (slider) {
          slider.value = value;
        } else if (checkbox) {
          checkbox.value = value;
        }
      }
    });
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
