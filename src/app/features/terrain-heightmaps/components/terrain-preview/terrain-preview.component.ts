import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../../shared/components/button/classes/button.class';
import { IconPosition } from '../../../../shared/components/button/enum/button.enum';
import { Slider } from '../../../../shared/components/slider/classes/slider.class';
import { UiFactoryService } from '../../../../shared/services/ui-factory.service';
import { VolumePreviewService } from '../../../3d-volumes/services/volume-preview.service';
import { TerrainPreviewService } from '../../services/terrain-preview.service';
import { SliderComponent } from '../../../../shared/components/slider/slider.component';

@Component({
  selector: 'app-terrain-preview',
  imports: [SliderComponent],
  templateUrl: './terrain-preview.component.html',
  styleUrl: './terrain-preview.component.scss'
})
export class TerrainPreviewComponent implements OnInit, OnDestroy {

  @ViewChild('previewElement') previewElement: ElementRef<HTMLCanvasElement>;
  @Input() open: boolean = false;

  public resetCameraBtn: Button = null;
  public previewHeightScale: Slider = null;

  constructor(
    private uiFactory: UiFactoryService,
    private previewService: TerrainPreviewService) { }

  ngOnInit(): void {
    this.resetCameraBtn = this.uiFactory.buildButton(
      "Reset camera",
      "btn-info",
      faRotateLeft,
      IconPosition.LEFT
    );

    this.previewHeightScale = this.uiFactory.buildSlider(
      "Height scale",
      "previewHeightScale",
      10,
      -100.,
      100.,
      0.1
    );
  }

  ngOnChanges(): void {
    if (!this.previewElement?.nativeElement) return;

    if (this.open) {
      this.previewService.startInit(this.previewElement.nativeElement);
      this.previewService.startRendering();
    } else {
      this.previewService.pauseRendering();
    }
  }

  ngOnDestroy(): void {
    this.previewService.onDestroy();
  }

  public onUniformChange(slider: Slider): void {
    this.previewService.updateShaderUniform(slider.uniformName, slider.value);
  }

  public onResetCamera(): void {
    this.previewService.resetCamera();
  }
}