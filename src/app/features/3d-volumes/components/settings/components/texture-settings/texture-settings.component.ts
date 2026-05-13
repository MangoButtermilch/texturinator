import { Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { CustomInput } from '../../../../../../shared/components/input/classes/customInput.class';
import { InputComponent } from '../../../../../../shared/components/input/input.component';
import { Slider } from '../../../../../../shared/components/slider/classes/slider.class';
import { SliderComponent } from '../../../../../../shared/components/slider/slider.component';
import { ShaderConfig, IVector2 } from '../../../../interfaces/shader-configs.interfaces';
import { UiFactoryService } from '../../../../../../shared/services/ui-factory.service';
import { getMaxTextureSize } from '../../../../../../shared/utils/webgl.utils';
import { CanvasService } from '../../../../services/canvas.service';


@Component({
  selector: 'app-texture-settings',
  imports: [SliderComponent, InputComponent],
  templateUrl: './texture-settings.component.html',
  styleUrl: './texture-settings.component.scss'
})
export class TextureSettingsComponent implements OnInit {

  public maxTextureSize: number = 0;

  public sliders: Slider[];

  public inputTextureSizeX: CustomInput;
  public inputTextureSizeY: CustomInput;

  private outputResolution: IVector2 = this.canvasService.getOutputResolution();

  constructor(
    private uiFactory: UiFactoryService,
    private canvasService: CanvasService
  ) { }

  ngOnInit(): void {

    this.inputTextureSizeX = this.uiFactory.buildInput("x:", "textureSizeX", 4096,
      { min: 32, max: getMaxTextureSize() });

    this.inputTextureSizeY = this.uiFactory.buildInput("y:", "textureSizeY", 4096,
      { min: 32, max: getMaxTextureSize() });

    this.sliders = [
      this.uiFactory.buildSlider("Twirl", "cellTwirlStrength", 0, -10, 10),
      this.uiFactory.buildSlider("Radial shear", "cellRadialShearStrength", 0, -10, 10),
      this.uiFactory.buildSlider("Spherize", "cellSpherizeStrength", 0, -10, 10),
    ];

    this.maxTextureSize = getMaxTextureSize();
  }

  public updateOutputResolutionX(value: string | number): void {
    if (typeof value == "string") {
      value = parseInt(value);
    }
    this.outputResolution.x = value;
    this.canvasService.updateOutputResolution(
      { x: value, y: this.outputResolution.y }
    );
  }

  public updateOutputResolutionY(value: string | number): void {
    if (typeof value == "string") {
      value = parseInt(value);
    }
    this.outputResolution.y = value;
    this.canvasService.updateOutputResolution(
      { x: this.outputResolution.x, y: value }
    );
  }

  public onSliderChange(slider: Slider): void {
    this.canvasService.updateShaderUniform(slider.uniformName, slider.value);
  }

  private getSliderByUniformName(name: string): Slider | null {
    if (!this.sliders) return null;
    return this.sliders.find((other) => other.uniformName === name);
  }

}
