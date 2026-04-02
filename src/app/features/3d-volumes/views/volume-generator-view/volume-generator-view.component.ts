import { Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { faEye, faSave, faClose, faBars } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { Button } from '../../../../shared/components/button/classes/button.class';
import { IconPosition } from '../../../../shared/components/button/enum/button.enum';
import { DialogSize } from '../../../../shared/components/dialog/enum/dialog-size.enum';
import { UiFactoryService } from '../../../../shared/services/ui-factory.service';
import { CanvasService } from '../../services/canvas.service';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { CanvasComponent } from '../../components/canvas/canvas.component';
import { MainSettingsComponent } from '../../components/settings/components/main-settings/main-settings.component';
import { NoiseSettingsComponent } from '../../components/settings/components/noise-settings/noise-settings.component';
import { TextureSettingsComponent } from '../../components/settings/components/texture-settings/texture-settings.component';
import { VolumePreviewComponent } from '../../components/volume-preview/volume-preview.component';

@Component({
  selector: 'app-volume-generator-view',
  imports: [
    CommonModule,
    MainSettingsComponent,
    TextureSettingsComponent,
    NoiseSettingsComponent,
    CanvasComponent,
    ButtonComponent,
    DialogComponent,
    VolumePreviewComponent
  ],
  templateUrl: './volume-generator-view.component.html',
  styleUrl: './volume-generator-view.component.scss'
})
export class VolumeGeneratorViewComponent implements OnInit {

  DialogSize = DialogSize;

  public previewBtn: Button;
  public exportBtn: Button;
  public menuOpen: boolean = true;
  public canvasLoading$: Observable<boolean> = this.canvasService.getCanvasLoading()
    .pipe(takeUntilDestroyed());

  public openButton: Button;
  public closeButton: Button;

  public previewOpen: boolean = false;

  constructor(
    private uiFactory: UiFactoryService,
    private canvasService: CanvasService) { }

  ngOnInit(): void {
    this.previewBtn = this.uiFactory.buildButton(
      "Show preview",
      "btn-info",
      faEye,
      IconPosition.LEFT
    );
    this.exportBtn = this.uiFactory.buildButton(
      "Save PNG",
      "btn-success",
      faSave,
      IconPosition.LEFT
    );

    this.openButton = this.uiFactory.buildButton(
      "",
      "btn-menu-mobile open",
      faClose
    );
    this.closeButton = this.uiFactory.buildButton(
      "",
      "btn-menu-mobile close",
      faBars
    );
  }

  public onExport(): void {
    this.canvasService.exportAsPng();
  }

  public onPreview(): void {
    this.previewOpen = true;
  }
}
