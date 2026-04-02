import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Button } from '../../../../shared/components/button/classes/button.class';
import { IconPosition } from '../../../../shared/components/button/enum/button.enum';
import { Slider } from '../../../../shared/components/slider/classes/slider.class';
import { SliderComponent } from '../../../../shared/components/slider/slider.component';
import { UiFactoryService } from '../../../../shared/services/ui-factory.service';
import { VolumePreviewService } from '../../services/volume-preview.service';

@Component({
  selector: 'app-volume-preview',
  imports: [ButtonComponent, SliderComponent],
  templateUrl: './volume-preview.component.html',
  styleUrl: './volume-preview.component.scss'
})
export class VolumePreviewComponent implements OnInit, OnDestroy {

  @ViewChild('previewElement') previewElement: ElementRef<HTMLCanvasElement>;
  @Input() open: boolean = false;

  public resetCameraBtn: Button = null;
  public densityMult: Slider = null;
  public maxSteps: Slider = null;
  public stepSize: Slider = null;

  constructor(
    private uiFactory: UiFactoryService,
    private previewService: VolumePreviewService) { }

  ngOnInit(): void {
    this.resetCameraBtn = this.uiFactory.buildButton(
      "Reset camera",
      "btn-info",
      faRotateLeft,
      IconPosition.LEFT
    );

    this.densityMult = this.uiFactory.buildSlider(
      "Density multiplier",
      "densityMult",
      1.,
      0.,
      1.,
      0.001
    );
    this.maxSteps = this.uiFactory.buildSlider(
      "Max steps",
      "maxSteps",
      70,
      40,
      256,
      1
    );
    this.stepSize = this.uiFactory.buildSlider(
      "Step size",
      "stepSize",
      0.01,
      0.00001,
      0.1,
      0.000001
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