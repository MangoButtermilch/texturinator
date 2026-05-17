import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, take } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VolumeService } from './volume-service';
import { IUniform } from 'three';
import { IVector2 } from '../interfaces/shader-configs.interfaces';
import { ShaderLoaderService } from '../../../shared/services/shader-loader.service';

@Injectable({
  providedIn: 'root'
})
export class VolumePreviewService {
  private maxFPS = 30;
  private lastFrameTime = 0;

  private canvas: HTMLCanvasElement = null;
  private orbitControls: OrbitControls = null;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private material: THREE.ShaderMaterial;
  private resolution: IVector2;

  private canvasLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private doRender: boolean = false;

  private onInit$: Subject<HTMLCanvasElement> = new Subject<HTMLCanvasElement>();
  private initialized: boolean = false;

  private initialCameraPosition = new THREE.Vector3();
  private initialCameraTarget = new THREE.Vector3();

  private shaderUniforms$: Observable<{ [uniform: string]: IUniform<any>; }> = this.canvasService.getShaderUniforms();
  private shaderUniforms: { [uniform: string]: IUniform<any>; } = null;
  private quad: THREE.Mesh = null;

  constructor(
    private canvasService: VolumeService,
    private shaderLoader: ShaderLoaderService) {
    this.handleShaderUniforms();
    this.handleOnInit();
  }

  private handleShaderUniforms(): void {
    this.shaderUniforms$.subscribe((uniforms) => {
      this.shaderUniforms = uniforms;

      if (this.material) {

        for (const [key, value] of Object.entries(this.shaderUniforms)) {
          this.material.uniforms[key].value = this.shaderUniforms[key].value;
        }
      }
    });
  }

  public startInit(element: HTMLCanvasElement): void {
    if (this.initialized) return;
    this.onInit$.next(element);
  }

  public handleOnInit(): void {
    this.onInit$.subscribe((element) => {
      window.addEventListener("resize", this.onResize);
      this.setup(element);
    })
  }

  public onDestroy(): void {
    window.removeEventListener("resize", this.onResize);
    this.renderer?.dispose();
    this.initialized = false;
  }

  private async setup(element: HTMLCanvasElement): Promise<void> {
    this.setCanvasLoading(true);

    this.canvas = element;
    const bounds = this.canvas.getBoundingClientRect();

    this.resolution = { x: bounds.width, y: bounds.height };

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, bounds.width / bounds.height, 0.1, 100);  // aspect=1
    this.camera.position.set(0, 0, 2);
    this.camera.updateProjectionMatrix();

    this.orbitControls = new OrbitControls(this.camera, this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(bounds.width, bounds.height);

    await this.loadShaderAndMaterialConfiguration();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, this.material);
    this.quad = quad;
    this.scene.add(quad);

    this.initialCameraPosition.copy(this.camera.position);
    this.initialCameraTarget.copy(this.orbitControls.target);

    this.setCanvasLoading(false);
    this.startRenderLoop();
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
        fragment: "/assets/shaders/3d-volume-generator/volume-preview/fragment.glsl",
        vertex: "/assets/shaders/3d-volume-generator/volume-preview/vertex.glsl",
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
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      uniforms: {
        ...this.shaderUniforms,
        densityMult: { value: 1.0 },
        stepSize: { value: 0.01 },
        maxSteps: { value: 70 },
        cameraPos: { value: this.camera.position }
      },
      vertexShader: shaderFiles['vertex'],
      fragmentShader: shaderSetupFragment
    });
  }

  private onResize = (): void => {
    const bounds = this.canvas.getBoundingClientRect();
    this.resolution = { x: bounds.width, y: bounds.height };

    this.camera.aspect = bounds.width / bounds.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(bounds.width, bounds.height);
  }

  private renderLoop = (time: number) => {
    const delta = time - this.lastFrameTime;
    const minFrameTime = 1000 / this.maxFPS;

    if (delta >= minFrameTime && this.doRender) {
      this.lastFrameTime = time;
      this.orbitControls.update();
      this.material.uniformsNeedUpdate = true;
      this.renderer.render(this.scene, this.camera);
    }

    requestAnimationFrame(this.renderLoop);
  };

  private startRenderLoop(): void {
    requestAnimationFrame(this.renderLoop);
  }

  public getCanvasLoading(): Observable<boolean> {
    return this.canvasLoading$.asObservable();
  }

  private setCanvasLoading(loading: boolean): void {
    this.canvasLoading$.next(loading);
  }

  public startRendering(): void {
    this.doRender = true;
  }

  public pauseRendering(): void {
    this.doRender = false;
  }

  public resetCamera(): void {
    this.camera.position.copy(this.initialCameraPosition);
    this.camera.lookAt(this.initialCameraTarget);

    this.orbitControls.target.copy(this.initialCameraTarget);
    this.orbitControls.update();
  }

  public updateShaderUniform(uniformName: string, value: any): void {
    if (this.material.uniforms[uniformName]) {
      this.material.uniforms[uniformName].value = value;
      this.material.uniformsNeedUpdate = true;
    } else {
      console.warn("Unknown uniform: " + uniformName);
    }
  }
}
