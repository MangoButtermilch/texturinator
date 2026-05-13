import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { DefaultCanvas } from '../../../core/services/default-canvas.class';
import { ShaderLoaderService } from '../../../shared/services/shader-loader.service';

@Injectable({
  providedIn: 'root'
})
export class CanvasService extends DefaultCanvas {

  constructor(private shaderLoader: ShaderLoaderService) {
    super();
  }

  protected async loadShaderAndMaterialConfiguration(): Promise<void> {

    const noiseLibFiles = await this.shaderLoader.loadShaders(
      {
        noiseUtils: "/assets/shaders/lib/noise/0-noise-utils.glsl",
        phacelleNoise: "/assets/shaders/lib/noise/6-phacelle-noise.glsl",
      }
    );
    const shaderFiles = await this.shaderLoader.loadShaders(
      {
        uniforms: "/assets/shaders/terrain-heightmaps/1-uniforms.glsl",
        fragment: "/assets/shaders/terrain-heightmaps/2-fragment.glsl",
        vertex: "/assets/shaders/terrain-heightmaps/3-vertex.glsl",
      }
    );

    const shaderSetupFragment =
      shaderFiles['uniforms']
        .concat(noiseLibFiles['noiseUtils'])
        .concat(noiseLibFiles['phacelleNoise'])
        .concat(shaderFiles['fragment']);

    this.material = new THREE.ShaderMaterial({
      vertexShader: shaderFiles['vertex'],
      fragmentShader: shaderSetupFragment
    });
    this.setupShaderUniforms();
    this.shaderUniforms$.next(this.material.uniforms);
  }

  protected setupShaderUniforms(): void {
    this.material.uniforms = {
      resolution: { value: new THREE.Vector2(this.resolution.x, this.resolution.y) },
      EROSION_SCALE: { value: 0.15 },
      EROSION_STRENGTH: { value: 0.22 },
      EROSION_GULLY_WEIGHT: { value: 0.5 },
      EROSION_DETAIL: { value: 1.5 },
      ridgeRounding: { value: 0.1 },
      creaseRounding: { value: 0.0 },
      //last two parameters = ridgeRound & creaseRounding
      EROSION_ROUNDING: { value: new THREE.Vector4(0.1, 0.0, 0.1, 2.0) },
      EROSION_ONSET: { value: new THREE.Vector4(1.25, 1.25, 2.8, 1.5) },
      EROSION_ASSUMED_SLOPE: { value: new THREE.Vector2(0.7, 1.0) },
      EROSION_CELL_SCALE: { value: 0.7 },
      EROSION_NORMALIZATION: { value: 0.5 },
      EROSION_OCTAVES: { value: 5 },
      EROSION_LACUNARITY: { value: 2.0 },
      EROSION_GAIN: { value: 0.5 },
      TERRAIN_HEIGHT_OFFSET: { value: new THREE.Vector2(-0.65, 0.0) },
      HEIGHT_FREQUENCY: { value: 3.0 },
      HEIGHT_AMP: { value: 0.125 },
      HEIGHT_OCTAVES: { value: 3 },
      HEIGHT_LACUNARITY: { value: 2.0 },
      HEIGHT_GAIN: { value: 0.1 },
      //custom
      SHOW_RED_CHANNEL: { value: 1 },
      SHOW_GREEN_CHANNEL: { value: 1 },
      SHOW_BLUE_CHANNEL: { value: 0 },
      SHOW_ALPHA_CHANNEL: { value: 0 },
      COMBINE_DATA_CHANNELS: { value: 1 },
    };
    this.material.needsUpdate = true;
  }

}
