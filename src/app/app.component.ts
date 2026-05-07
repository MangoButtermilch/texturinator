import { Component } from '@angular/core';
import { environment } from '../environments/environment.development';
import { VolumeGeneratorViewComponent } from './features/3d-volumes/views/volume-generator-view/volume-generator-view.component';
import { TerrainGeneratorViewComponent } from "./features/terrain-heightmaps/views/terrain-generator-view/terrain-generator-view.component";

@Component({
  selector: 'app-root',
  imports: [VolumeGeneratorViewComponent, TerrainGeneratorViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  public version = environment.version;

}
