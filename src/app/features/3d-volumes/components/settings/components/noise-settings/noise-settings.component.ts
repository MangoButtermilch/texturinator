import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CanvasService } from '../../../../services/canvas.service';
import { NoiseLayerComponent } from './components/noise-layer/noise-layer.component';


@Component({
  selector: 'app-noise-settings',
  imports: [NoiseLayerComponent, CommonModule],
  templateUrl: './noise-settings.component.html',
  styleUrl: './noise-settings.component.scss'
})
export class NoiseSettingsComponent {

  public noiseLayers$ = this.canvasService.getShaderConfig();

  constructor(
    private canvasService: CanvasService
  ) { }

}
