import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment.development';
import { CommonModule } from '@angular/common';
import { VolumeGeneratorViewComponent } from './features/3d-volumes/views/volume-generator-view/volume-generator-view.component';
import { TerrainGeneratorViewComponent } from './features/terrain-heightmaps/views/terrain-generator-view/terrain-generator-view.component';
import { BehaviorSubject } from 'rxjs';
import { MenuType } from './shared/enum/menu-type.enum';
import { SettingsService } from './shared/services/settings.service';
import { NormalMapGeneratorViewComponent } from './features/normal-map-generator/views/normal-map-generator-view/normal-map-generator-view.component';

@Component({
  selector: 'app-root',
  imports: [
    TerrainGeneratorViewComponent,
    VolumeGeneratorViewComponent,
    NormalMapGeneratorViewComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  private readonly lastMenuSetting: string = "last-menu";

  public MenuType = MenuType;
  public currentMenu$ = new BehaviorSubject<MenuType>(MenuType.VOLUME_GENERATOR);
  public version = environment.version;

  public menus = [
    MenuType.VOLUME_GENERATOR,
    MenuType.TERRAIN_GENERATOR,
    MenuType.NORMAL_MAP_GENERATOR
  ];

  constructor(private settings: SettingsService) { }

  ngOnInit(): void {
    this.loadLastMenu();
  }

  private loadLastMenu(): void {
    const storedMenu = this.settings.getLocalSetting(this.lastMenuSetting);
    if (storedMenu) {
      this.currentMenu$.next(storedMenu as MenuType);
      return;
    }
    this.settings.saveLocalSetting(this.lastMenuSetting, this.currentMenu$.value);
  }

  public getLabelForMenuItem(menu: MenuType) {
    switch (menu) {
      case MenuType.VOLUME_GENERATOR: return "Volume Generator";
      case MenuType.TERRAIN_GENERATOR: return "Terrain Generator";
      case MenuType.NORMAL_MAP_GENERATOR: return "Normal Map Generator";
    }
  }

  public switchTab(menu: MenuType) {
    this.settings.saveLocalSetting(this.lastMenuSetting, menu);
    this.currentMenu$.next(menu);
  }
}
