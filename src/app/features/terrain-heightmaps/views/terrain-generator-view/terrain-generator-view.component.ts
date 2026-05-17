import { Component } from '@angular/core';
import { CanvasService } from '../../services/canvas.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NoiseSettingsComponent } from "../../components/settings/components/noise-settings/noise-settings.component";
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { faEye, faSave, faClose, faBars } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../../shared/components/button/classes/button.class';
import { IconPosition } from '../../../../shared/components/button/enum/button.enum';
import { DialogSize } from '../../../../shared/components/dialog/enum/dialog-size.enum';
import { UiFactoryService } from '../../../../shared/services/ui-factory.service';
import { TextureSettingsComponent } from '../../components/settings/components/texture-settings/texture-settings.component';
import { TerrainSettingsComponent } from '../../components/settings/components/terrain-settings/terrain-settings.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { CanvasComponent } from '../../../../shared/components/canvas/canvas.component';

@Component({
  selector: 'app-terrain-generator-view',
  imports: [
    CanvasComponent,
    CommonModule,
    NoiseSettingsComponent,
    ButtonComponent,
    TextureSettingsComponent,
    TerrainSettingsComponent,
    DialogComponent
  ],
  templateUrl: './terrain-generator-view.component.html',
  styleUrls: ['./terrain-generator-view.component.scss', '../../../../shared/scss/settings.scss']
})
export class TerrainGeneratorViewComponent {

  DialogSize = DialogSize;

  public previewBtn: Button;
  public exportRawBtn: Button;
  public exportPngBtn: Button;
  public menuOpen: boolean = true;
  public canvasLoading$: Observable<boolean> = this.canvasService.getCanvasLoading()
    .pipe(
      startWith(true),
      takeUntilDestroyed());

  public openButton: Button;
  public closeButton: Button;

  public previewOpen: boolean = false;

  constructor(
    private uiFactory: UiFactoryService,
    public canvasService: CanvasService) { }

  ngOnInit(): void {
    this.previewBtn = this.uiFactory.buildButton(
      "Show preview",
      "btn-info",
      faEye,
      IconPosition.LEFT
    );
    this.exportRawBtn = this.uiFactory.buildButton(
      "Save RAW",
      "btn-success",
      faSave,
      IconPosition.LEFT
    );
    this.exportPngBtn = this.uiFactory.buildButton(
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

  public onExportPng(): void {
    this.canvasService.exportAsPng();
  }

  public onExportRaw(): void {
    this.canvasService.exportAsRaw16();
  }

  public onPreview(): void {
    this.previewOpen = true;
  }
}
