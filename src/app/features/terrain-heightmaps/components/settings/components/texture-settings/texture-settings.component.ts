import { Component, OnInit } from '@angular/core';
import { CustomInput } from '../../../../../../shared/components/input/classes/customInput.class';
import { InputComponent } from '../../../../../../shared/components/input/input.component';
import { UiFactoryService } from '../../../../../../shared/services/ui-factory.service';
import { getMaxTextureSize } from '../../../../../../shared/utils/webgl.utils';
import { IVector2 } from '../../../../../3d-volumes/interfaces/shader-configs.interfaces';
import { TerrainHeightmapService } from '../../../../services/terrain-heightmap-service';
import { CheckboxComponent } from "../../../../../../shared/components/checkbox/checkbox.component";
import { Checkbox } from '../../../../../../shared/components/checkbox/classes/checkbox.class';

@Component({
  selector: 'app-texture-settings',
  imports: [InputComponent, CheckboxComponent],
  templateUrl: './texture-settings.component.html',
  styleUrl: './texture-settings.component.scss'
})
export class TextureSettingsComponent implements OnInit {

  public checkboxes: Checkbox[] = [];
  public maxTextureSize: number = 0;

  public inputTextureSizeX: CustomInput;
  public inputTextureSizeY: CustomInput;

  private outputResolution: IVector2 = this.canvasService.getOutputResolution();

  constructor(
    private uiFactory: UiFactoryService,
    private canvasService: TerrainHeightmapService
  ) { }

  ngOnInit(): void {

    this.inputTextureSizeX = this.uiFactory.buildInput("x:", "textureSizeX", 4096,
      { min: 32, max: getMaxTextureSize() });

    this.inputTextureSizeY = this.uiFactory.buildInput("y:", "textureSizeY", 4096,
      { min: 32, max: getMaxTextureSize() });

    this.maxTextureSize = getMaxTextureSize();

    this.checkboxes = [
      this.uiFactory.buildCheckbox("Show red channel", "SHOW_RED_CHANNEL", true),
      this.uiFactory.buildCheckbox("Show green channel", "SHOW_GREEN_CHANNEL", true),
      this.uiFactory.buildCheckbox("Show blue channel (empty)", "SHOW_BLUE_CHANNEL", false),
      this.uiFactory.buildCheckbox("Show alpha Channel (debug)", "SHOW_ALPHA_CHANNEL", false),
      this.uiFactory.buildCheckbox("Combine data channels", "COMBINE_DATA_CHANNELS", true)
    ];
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

  public onCheckboxChange(checkbox: Checkbox): void {
    this.canvasService.updateShaderUniform(checkbox.uniformName, checkbox.value);
  }
}
