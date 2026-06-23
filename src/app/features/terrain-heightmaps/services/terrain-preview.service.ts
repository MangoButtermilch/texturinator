import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { IUniform } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShaderLoaderService } from '../../../shared/services/shader-loader.service';
import { IVector2 } from '../../3d-volumes/interfaces/shader-configs.interfaces';
import { VolumeService } from '../../3d-volumes/services/volume-service';
import * as THREE from 'three';
import { TerrainHeightmapService } from './terrain-heightmap-service';

@Injectable({
  providedIn: 'root'
})
export class TerrainPreviewService {
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
    private canvasService: TerrainHeightmapService,
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
    this.camera.position.set(0, 3, 2);
    this.camera.updateProjectionMatrix();

    this.orbitControls = new OrbitControls(this.camera, this.canvas);
    this.orbitControls.target.set(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(bounds.width, bounds.height);

    await this.loadShaderAndMaterialConfiguration();
    const geometry = new THREE.PlaneGeometry(2, 2, 512, 512);
    const quad = new THREE.Mesh(geometry, this.material);
    this.quad = quad;
    this.quad.rotation.x = -Math.PI * 0.5;
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
        phacelleNoise: "/assets/shaders/lib/noise/6-phacelle-noise.glsl",
      }
    );
    const shaderFiles = await this.shaderLoader.loadShaders(
      {
        uniforms: "/assets/shaders/terrain-heightmaps/terrain-preview/1-uniforms.glsl",
        fragment: "/assets/shaders/terrain-heightmaps/terrain-preview/2-fragment.glsl",
        vertex: "/assets/shaders/terrain-heightmaps/terrain-preview/3-vertex.glsl",
      }
    );

    const shaderSetupFragment = shaderFiles['uniforms']
      .concat(shaderFiles['fragment']);

    const shaderSetupVertex =
      shaderFiles['uniforms']
        .concat(noiseLibFiles['noiseUtils'])
        .concat(noiseLibFiles['phacelleNoise'])
        .concat(shaderFiles['vertex']);



    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: true,
      depthTest: true,
      side: THREE.FrontSide,
      blending: THREE.NormalBlending,
      uniforms: {
        ...this.shaderUniforms,
        previewHeightScale: { value: 1.0 },
        cameraPos: { value: this.camera.position }
      },
      vertexShader: shaderSetupVertex,
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
