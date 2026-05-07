import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Observable } from 'rxjs';
import * as THREE from 'three';
import { IUniform } from 'three';
import { ShaderLoaderService } from '../../../shared/services/shader-loader.service';
import { setupShaderUniforms, noiseTypeToId, mapIndexToVec4Component } from '../../../shared/utils/shader.utils';
import { IVector2, ShaderConfig, defaultConfig, NoiseLayer } from '../../3d-volumes/interfaces/shader-configs.interfaces';

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

  private outputResolution$ = new BehaviorSubject<IVector2>({ x: 4096, y: 4096 });

  private renderPending: boolean = false;
  private canvasLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private shaderUniforms$ = new ReplaySubject<{ [uniform: string]: IUniform<any>; }>();

  constructor(private shaderLoader: ShaderLoaderService) {
    window.addEventListener("resize", this.onResize);
  }

  public onDestroy(): void {
    this.renderer.dispose();
  }

  public getShaderUniforms(): Observable<{ [uniform: string]: IUniform<any>; }> {
    return this.shaderUniforms$.asObservable();
  }

  public async setup(element: HTMLCanvasElement): Promise<void> {
    this.setCanvasLoading(true);

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
    this.setupShaderUniforms(this.resolution, this.material);
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
    if (this.material.uniforms[uniformName]) {
      this.material.uniforms[uniformName].value = value;
      this.scheduleRender();
    } else {
      console.warn("Unknown uniform: " + uniformName);
    }
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
  public exportAsRaw16(): void {
    this.setCanvasLoading(true);

    setTimeout(() => {
      const resolution = this.getOutputResolution();

      const renderTarget = new THREE.WebGLRenderTarget(resolution.x, resolution.y, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType
      });

      const originalSize = new THREE.Vector2();
      this.renderer.getSize(originalSize);
      const originalRenderTarget = this.renderer.getRenderTarget();

      const originalColorSpace = this.renderer.outputColorSpace;
      const originalToneMapping = this.renderer.toneMapping;
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.NoToneMapping;

      this.renderer.setRenderTarget(renderTarget);
      this.renderer.setSize(resolution.x, resolution.y);
      this.material.uniforms['resolution'].value.set(resolution.x, resolution.y);
      this.renderer.render(this.scene, this.camera);

      const buffer = new Float32Array(resolution.x * resolution.y * 4);
      this.renderer.readRenderTargetPixels(renderTarget, 0, 0, resolution.x, resolution.y, buffer);

      const w = resolution.x;
      const h = resolution.y;
      const heightData = new Uint16Array(w * h);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const srcRow = h - 1 - y;
          const srcIdx = (srcRow * w + x) * 4; // R
          const dstIdx = y * w + x;

          const raw = buffer[srcIdx];
          const clamped = Math.max(0, Math.min(1, raw));
          heightData[dstIdx] = Math.round(clamped * 65535); // round statt floor
        }
      }

      // Unity expects Little Endian – Uint16Array.buffer  x86/ARM  LE
      const blob = new Blob([heightData.buffer], { type: "application/octet-stream" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "heightmap.raw";
      a.click();

      this.renderer.outputColorSpace = originalColorSpace;
      this.renderer.toneMapping = originalToneMapping;
      this.renderer.setRenderTarget(originalRenderTarget);
      this.renderer.setSize(originalSize.x, originalSize.y);
      this.material.uniforms['resolution'].value.set(originalSize.x, originalSize.y);

      renderTarget.dispose();
      this.scheduleRender();
      this.setCanvasLoading(false);
    }, 100);
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
        a.download = "heightmap.png";
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

  private setupShaderUniforms(
    resolution: IVector2,
    material: THREE.ShaderMaterial): void {
    material.uniforms = {
      resolution: { value: new THREE.Vector2(resolution.x, resolution.y) },
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
    material.needsUpdate = true;
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
