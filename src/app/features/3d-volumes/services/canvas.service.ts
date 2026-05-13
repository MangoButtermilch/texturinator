import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { DefaultCanvas } from '../../../core/services/default-canvas.class';
import { ShaderLoaderService } from '../../../shared/services/shader-loader.service';
import { defaultConfig, NoiseLayer, ShaderConfig } from '../interfaces/shader-configs.interfaces';
import { mapIndexToVec4Component, noiseTypeToId } from '../utils/shader.utils';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CanvasService extends DefaultCanvas {

  private config: ShaderConfig = defaultConfig;

  constructor(private shaderLoader: ShaderLoaderService) {
    super();
  }

  protected async loadShaderAndMaterialConfiguration(): Promise<void> {
    const noiseLibFiles = await this.shaderLoader.loadShaders(
      {
        noiseUtils: "/assets/shaders/lib/noise/0-noise-utils.glsl",
        perlinNoise3d: "/assets/shaders/lib/noise/1-perlin-noise.glsl",
        simplexNoise3d: "/assets/shaders/lib/noise/2-simplex-noise.glsl",
        voronoi3d: "/assets/shaders/lib/noise/3-voronoi-noise.glsl",
        nebula3d: "/assets/shaders/lib/noise/4-nebula-noise.glsl",
      }
    );
    const shaderFiles = await this.shaderLoader.loadShaders(
      {
        uniforms: "/assets/shaders/3d-volume-generator/1-uniforms.glsl",
        uvUtils: "/assets/shaders/3d-volume-generator/2-uv-utils.glsl",
        noiseLayers: "/assets/shaders/3d-volume-generator/3-noise-layers.glsl",
        fragment: "/assets/shaders/3d-volume-generator/4-fragment.glsl",
        vertex: "/assets/shaders/3d-volume-generator/5-vertex.glsl",
      }
    );

    const shaderSetupFragment =
      noiseLibFiles['noiseUtils']
        .concat(noiseLibFiles['perlinNoise3d'])
        .concat(noiseLibFiles['simplexNoise3d'])
        .concat(noiseLibFiles['voronoi3d'])
        .concat(noiseLibFiles['nebula3d'])
        .concat(shaderFiles['noiseLayers'])
        .concat(shaderFiles['uniforms'])
        .concat(shaderFiles['uvUtils'])
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
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2(this.resolution.x, this.resolution.y) },
      totalBrightness: { value: this.config.totalBrightness },
      depth: { value: this.config.depth },
      numCells: { value: this.config.numCells },
      tilingPerCell: { value: this.config.tilingPerCell },
      positionOffset: {
        value: new THREE.Vector3(
          this.config.positionOffset.x,
          this.config.positionOffset.y,
          this.config.positionOffset.z
        )
      },
      growAndShrinkCells: { value: this.config.growAndShrinkCells },
      borderStrength: { value: this.config.borderStrength },
      centerStrength: { value: this.config.centerStrength },
      centerRadius: { value: this.config.centerRadius },
      hideFirstCell: { value: this.config.hideFirstCell },
      hideLastCell: { value: this.config.hideLastCell },
      cellTwirlStrength: { value: this.config.cellTwirlStrength },
      cellSpherizeStrength: { value: this.config.cellSpherizeStrength },
      cellRadialShearStrength: { value: this.config.cellRadialShearStrength },
      noiseLayerDistortion: {
        value: new THREE.Vector4(
          this.config.noiseLayerDistortion.x,
          this.config.noiseLayerDistortion.y,
          this.config.noiseLayerDistortion.z,
          this.config.noiseLayerDistortion.w,
        )
      },
      noiseLayerEnabled: {
        value: new THREE.Vector4(
          this.config.noiseLayerDistortion.x,
          this.config.noiseLayerDistortion.y,
          this.config.noiseLayerDistortion.z,
          this.config.noiseLayerDistortion.w,
        )
      },
      noiseLayerInverted: {
        value: new THREE.Vector4(
          this.config.noiseLayerDistortion.x,
          this.config.noiseLayerDistortion.y,
          this.config.noiseLayerDistortion.z,
          this.config.noiseLayerDistortion.w,
        )
      }
    };

    for (let i = 0; i < this.config.noiseLayers.length; i++) {
      const uniformName = `noiseLayer${i + 1}`;
      const noiseLayer = this.config.noiseLayers[i];
      const type = noiseTypeToId(noiseLayer.noiseType);

      const vector = new THREE.Vector4(
        noiseLayer.scale,
        noiseLayer.power,
        noiseLayer.angleOffset ?? 0,
        type
      );

      if (!this.material.uniforms[uniformName]) {
        this.material.uniforms[uniformName] = { value: vector };
      } else {
        this.material.uniforms[uniformName].value = vector;
      }

      const distortion = noiseLayer.distortion;
      const vectorComponent = mapIndexToVec4Component(i);
      this.config.noiseLayerDistortion[vectorComponent] = distortion;
      this.config.noiseLayerEnabled[vectorComponent] = noiseLayer.enabled;
      this.config.noiseLayerInverted[vectorComponent] = noiseLayer.inverted;

      this.material.uniforms['noiseLayerDistortion'].value = new THREE.Vector4(
        this.config.noiseLayerDistortion.x,
        this.config.noiseLayerDistortion.y,
        this.config.noiseLayerDistortion.z,
        this.config.noiseLayerDistortion.w,
      );
      this.material.uniforms['noiseLayerEnabled'].value = new THREE.Vector4(
        this.config.noiseLayerEnabled.x,
        this.config.noiseLayerEnabled.y,
        this.config.noiseLayerEnabled.z,
        this.config.noiseLayerEnabled.w,
      );
      this.material.uniforms['noiseLayerInverted'].value = new THREE.Vector4(
        this.config.noiseLayerInverted.x,
        this.config.noiseLayerInverted.y,
        this.config.noiseLayerInverted.z,
        this.config.noiseLayerInverted.w,
      );
    }

    this.material.needsUpdate = true;
  }

  public onNoiseLayerChange(noiseLayer: NoiseLayer): void {
    const uniformName = noiseLayer.uniformName;
    const type = noiseTypeToId(noiseLayer.noiseType);

    const layerIndex = uniformName.match(/\d+/)[0];
    const index = parseInt(layerIndex) - 1;
    const distortion = noiseLayer.distortion;
    const vectorComponent = mapIndexToVec4Component(index);
    this.config.noiseLayerDistortion[vectorComponent] = distortion;
    this.config.noiseLayerEnabled[vectorComponent] = noiseLayer.enabled;
    this.config.noiseLayerInverted[vectorComponent] = noiseLayer.inverted;


    this.material.uniforms['noiseLayerDistortion'].value.set(
      this.config.noiseLayerDistortion.x,
      this.config.noiseLayerDistortion.y,
      this.config.noiseLayerDistortion.z,
      this.config.noiseLayerDistortion.w,
    );
    this.material.uniforms['noiseLayerEnabled'].value.set(
      this.config.noiseLayerEnabled.x,
      this.config.noiseLayerEnabled.y,
      this.config.noiseLayerEnabled.z,
      this.config.noiseLayerEnabled.w,
    );
    this.material.uniforms['noiseLayerInverted'].value.set(
      this.config.noiseLayerInverted.x,
      this.config.noiseLayerInverted.y,
      this.config.noiseLayerInverted.z,
      this.config.noiseLayerInverted.w,
    );


    this.material.uniforms[uniformName].value.set(
      noiseLayer.scale,
      noiseLayer.power,
      noiseLayer.angleOffset ?? 0,
      type
    );
    this.scheduleRender();
  }
}
