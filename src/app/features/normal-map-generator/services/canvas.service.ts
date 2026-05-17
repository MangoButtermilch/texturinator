import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { DefaultCanvas } from '../../../core/services/default-canvas.class';
import { ShaderLoaderService } from '../../../shared/services/shader-loader.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IVector2 } from '../../3d-volumes/interfaces/shader-configs.interfaces';
import { getMaxTextureSize } from '../../../shared/utils/webgl.utils';

@Injectable({
  providedIn: 'root'
})
export class CanvasService extends DefaultCanvas {

  private showHint$ = new BehaviorSubject<boolean>(true);
  private updateOutputResolutionDisplay$ = new Subject<IVector2>();

  constructor(private shaderLoader: ShaderLoaderService) {
    super();
  }

  protected override async loadShaderAndMaterialConfiguration(): Promise<void> {

    const shaderFiles = await this.shaderLoader.loadShaders(
      {
        uniforms: "/assets/shaders/normal-map-generator/1-uniforms.glsl",
        fragment: "/assets/shaders/normal-map-generator/2-fragment.glsl",
        vertex: "/assets/shaders/normal-map-generator/3-vertex.glsl",
      }
    );

    const shaderSetupFragment = shaderFiles['uniforms']
      .concat(shaderFiles['fragment']);

    this.material = new THREE.ShaderMaterial({
      vertexShader: shaderFiles['vertex'],
      fragmentShader: shaderSetupFragment
    });
    this.setupShaderUniforms();
    this.shaderUniforms$.next(this.material.uniforms);
  }

  protected override setupShaderUniforms(): void {
    this.material.uniforms = {
      resolution: { value: new THREE.Vector2(this.resolution.x, this.resolution.y) },
      strength: { value: 0.5 },
      imageTexture: { value: null },
      imageSize: { value: new THREE.Vector2(1, 1) },
    };
    this.material.needsUpdate = true;
  }

  protected override afterSetup(): void {
    this.canvas.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    this.canvas.addEventListener("drop", (e) => {
      e.preventDefault();

      const file = e.dataTransfer?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const maxSize = getMaxTextureSize();
        const img = new Image();
        img.onload = () => {
          const texture = new THREE.Texture(img);
          if (texture.width > maxSize || texture.height > maxSize) {
            texture.dispose();
            return;
          }
          texture.needsUpdate = true;
          this.updateImageTexture(texture);
        };
        img.src = event.target?.result as string;
      };

      reader.readAsDataURL(file);
    });
  }

  private updateImageTexture(texture: THREE.Texture): void {
    this.showHint$.next(false);

    this.canvas.style.width = texture.width + "px";
    this.canvas.style.height = texture.height + "px";
    this.canvas.style.aspectRatio = "unset";
    this.updateOutputResolutionDisplay$.next({ x: texture.width, y: texture.height });
    this.updateOutputResolution({ x: texture.width, y: texture.height });
    this.updateResolutionAndCameraProjection();

    this.material.uniforms['imageTexture'].value = texture;
    this.material.uniforms['imageSize'].value = new THREE.Vector2(texture.width, texture.height);
    this.scheduleRender();
  }

  public getShowHint(): Observable<boolean> {
    return this.showHint$.asObservable();
  }

  public getOutputResolutionDisplay(): Observable<IVector2> {
    return this.updateOutputResolutionDisplay$.asObservable();
  }
}

