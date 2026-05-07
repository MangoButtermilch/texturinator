import { Component } from '@angular/core';
import { environment } from '../environments/environment.development';
import { CommonModule } from '@angular/common';
import { VolumeGeneratorViewComponent } from './features/3d-volumes/views/volume-generator-view/volume-generator-view.component';
import { TerrainGeneratorViewComponent } from './features/terrain-heightmaps/views/terrain-generator-view/terrain-generator-view.component';
import { BehaviorSubject } from 'rxjs';
import { MenuType } from './shared/enum/menu-type.enum';

@Component({
  selector: 'app-root',
  imports: [TerrainGeneratorViewComponent, VolumeGeneratorViewComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  public MenuType = MenuType;
  public currentMenu$ = new BehaviorSubject<MenuType>(MenuType.VOLUME_GENERATOR);
  public version = environment.version;

  public menus = [
    MenuType.VOLUME_GENERATOR,
    MenuType.TERRAIN_GENERATOR
  ];

  public getLabelForMenuItem(menu: MenuType) {
    switch (menu) {
      case MenuType.VOLUME_GENERATOR: return "Volume Generator";
      case MenuType.TERRAIN_GENERATOR: return "Terrain Generator";
    }
  }

  public switchTab(menu: MenuType) {
    this.currentMenu$.next(menu);
  }
}
