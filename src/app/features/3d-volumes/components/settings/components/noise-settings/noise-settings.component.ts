import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../../../../shared/components/button/classes/button.class';
import { IconPosition } from '../../../../../../shared/components/button/enum/button.enum';
import { defaultNoiseLayerConfig } from '../../../../interfaces/shader-configs.interfaces';
import { UiFactoryService } from '../../../../../../shared/services/ui-factory.service';
import { NoiseLayerComponent } from './components/noise-layer/noise-layer.component';


@Component({
  selector: 'app-noise-settings',
  imports: [NoiseLayerComponent, FontAwesomeModule],
  templateUrl: './noise-settings.component.html',
  styleUrl: './noise-settings.component.scss'
})
export class NoiseSettingsComponent implements OnInit {

  public addButton: Button;
  public noiseLayers = defaultNoiseLayerConfig;

  constructor(
    private uiFactory: UiFactoryService
  ) { }

  ngOnInit(): void {
    this.addButton = this.uiFactory.buildButton(
      "Add",
      "btn-success",
      faAdd,
      IconPosition.RIGHT
    )
  }
}
