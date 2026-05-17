import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { faEye, faSave, faClose, faBars } from '@fortawesome/free-solid-svg-icons';
import { Observable, startWith } from 'rxjs';
import { Button } from '../../../../shared/components/button/classes/button.class';
import { IconPosition } from '../../../../shared/components/button/enum/button.enum';
import { DialogSize } from '../../../../shared/components/dialog/enum/dialog-size.enum';
import { UiFactoryService } from '../../../../shared/services/ui-factory.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../../../../shared/components/canvas/canvas.component';
import { HeightmapGeneratorService } from '../../services/heightmap-generator-service';
import { TextureSettingsComponent } from '../../components/settings/texture-settings/texture-settings.component';
import { NormalMapSettingsComponent } from '../../components/settings/normal-map-settings/normal-map-settings.component';

@Component({
  selector: 'app-normal-map-generator-view',
  imports: [
    ButtonComponent,
    CommonModule,
    CanvasComponent,
    TextureSettingsComponent,
    NormalMapSettingsComponent
  ],
  templateUrl: './normal-map-generator-view.component.html',
  styleUrl: './normal-map-generator-view.component.scss'
})
export class NormalMapGeneratorViewComponent {
  DialogSize = DialogSize;

  public showHint$ = this.canvasService.getShowHint();
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
    public canvasService: HeightmapGeneratorService) { }

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