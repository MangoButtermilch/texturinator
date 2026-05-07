import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import * as THREE from 'three';
import { IUniform } from 'three';
import { IVector2, ShaderConfig, defaultConfig, NoiseLayer } from '../interfaces/shader-configs.interfaces';
import { ShaderLoaderService } from '../../../shared/services/shader-loader.service';
import { setupShaderUniforms, noiseTypeToId, mapIndexToVec4Component } from '../../../shared/utils/shader.utils';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  private canvas: HTMLCanvasElement = null;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private material: THREE.ShaderMaterial;
  private resolution: IVector2;

  private config$ = new BehaviorSubject<ShaderConfig>(defaultConfig);
  private config: ShaderConfig = defaultConfig;

  private outputResolution$ = new BehaviorSubject<IVector2>({ x: 4096, y: 4096 });

  private renderPending: boolean = false;
  private canvasLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private shaderUniforms$ = new ReplaySubject<{ [uniform: string]: IUniform<any>; }>();

  constructor(private shaderLoader: ShaderLoaderService) {
    window.addEventListener("resize", this.onResize);
  }

  public onDestroy(): void {
    window.removeEventListener("resize", this.onResize);
    this.renderer?.dispose();
  }

  public getShaderUniforms(): Observable<{ [uniform: string]: IUniform<any>; }> {
    return this.shaderUniforms$.asObservable();
  }

  public async setup(element: HTMLCanvasElement): Promise<void> {
   requestAnimationFrame(() => {this.setCanvasLoading(true);}) 

    this.canvas = element;
    const bounds = this.canvas.getBoundingClientRect();
    const size = Math.min(bounds.width, bounds.height);

    this.resolution = { x: size, y: size };

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);  // aspect=1
    this.camera.position.set(0, 0, 5);
    this.camera.updateProjectionMatrix();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(size, size);

    await this.loadShaderAndMaterialConfiguration();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, this.material);

    this.scene.add(quad);
    this.scheduleRender();

    this.setCanvasLoading(false);
  }

  private async loadShaderAndMaterialConfiguration(): Promise<void> {

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
    setupShaderUniforms(this.resolution, this.material, this.config);
    this.shaderUniforms$.next(this.material.uniforms);
  }

  private onResize = (): void => {
    const bounds = this.canvas.getBoundingClientRect();
    const size = Math.min(bounds.width, bounds.height);

    this.resolution = { x: size, y: size };

    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(size, size);
  }

  public updateShaderUniform(uniformName: string, value: any): void {
    this.config[uniformName] = value;
    if (this.material.uniforms[uniformName]) {
      this.material.uniforms[uniformName].value = value;
      this.scheduleRender();
    } else {
      console.warn("Unknown uniform: " + uniformName);
    }
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

  private scheduleRender(): void {
    this.shaderUniforms$.next(this.material.uniforms);

    if (!this.renderPending) {
      this.renderPending = true;
      requestAnimationFrame(() => {
        this.renderer.render(this.scene, this.camera);
        this.renderPending = false;
      });
    }
  }

  public exportAsPng(): void {
    this.setCanvasLoading(true);

    setTimeout(() => {

      const resolution = this.getOutputResolution();
      const renderTarget = new THREE.WebGLRenderTarget(resolution.x, resolution.y, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      });

      const originalSize = new THREE.Vector2();
      this.renderer.getSize(originalSize);
      const originalRenderTarget = this.renderer.getRenderTarget();

      this.renderer.setRenderTarget(renderTarget);
      this.renderer.setSize(resolution.x, resolution.y);
      this.material.uniforms['resolution'].value.set(resolution.x, resolution.y);
      this.renderer.render(this.scene, this.camera);

      const buffer = new Uint8Array(resolution.x * resolution.y * 4);
      this.renderer.readRenderTargetPixels(renderTarget, 0, 0, resolution.x, resolution.y, buffer);

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = resolution.x;
      exportCanvas.height = resolution.y;
      const ctx = exportCanvas.getContext("2d");

      const imageData = ctx.createImageData(resolution.x, resolution.y);
      imageData.data.set(buffer);

      //webgl texture specific
      ctx.putImageData(this.flipImageDataY(imageData), 0, 0);

      exportCanvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "noise-texture.png";
        a.click();
      }, "image/png");

      this.renderer.setRenderTarget(originalRenderTarget);
      this.renderer.setSize(originalSize.x, originalSize.y);
      this.material.uniforms['resolution'].value.set(originalSize.x, originalSize.y);
      renderTarget.dispose();
      this.scheduleRender();
      this.setCanvasLoading(false);
    }, 100);
  }

  private flipImageDataY(imageData: ImageData): ImageData {
    const width = imageData.width;
    const height = imageData.height;
    const flipped = new ImageData(width, height);

    for (let y = 0; y < height; y++) {
      const srcStart = y * width * 4;
      const destStart = (height - y - 1) * width * 4;
      flipped.data.set(imageData.data.slice(srcStart, srcStart + width * 4), destStart);
    }

    return flipped;
  }

  public getShaderConfig(): Observable<ShaderConfig> {
    return this.config$.asObservable();
  }

  public getOutputResolution(): IVector2 {
    return this.outputResolution$.value;
  }

  public updateOutputResolution(res: IVector2): void {
    return this.outputResolution$.next(res);
  }

  public getCanvasLoading(): Observable<boolean> {
    return this.canvasLoading$.asObservable();
  }

  private setCanvasLoading(loading: boolean): void {
    this.canvasLoading$.next(loading);
  }
}
