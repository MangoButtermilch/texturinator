
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import * as THREE from 'three';
import { IVector2 } from '../../features/3d-volumes/interfaces/shader-configs.interfaces';
import { exportAsPng8, exportAsRaw16 } from '../../shared/utils/canvas.utils';
import { IUniform } from 'three';

export abstract class BaseCanvasService {

    protected canvas: HTMLCanvasElement = null;
    protected scene: THREE.Scene;
    protected camera: THREE.PerspectiveCamera;
    protected renderer: THREE.WebGLRenderer;
    protected material: THREE.ShaderMaterial;
    protected resolution: IVector2;
    protected outputResolution$ = new BehaviorSubject<IVector2>({ x: 4096, y: 4096 });
    protected renderPending: boolean = false;
    protected canvasLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    protected shaderUniforms$ = new ReplaySubject<{ [uniform: string]: THREE.IUniform<any>; }>();

    constructor() {
        window.addEventListener("resize", this.onResize);
    }

    protected abstract setupShaderUniforms(): void;
    protected abstract loadShaderAndMaterialConfiguration(): Promise<void>;
    protected abstract afterSetup(): void;

    public async setup(element: HTMLCanvasElement): Promise<void> {
        return new Promise(resolve => {
            requestAnimationFrame(async () => {
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

                this.afterSetup();
                this.setCanvasLoading(false);
                resolve();
            });
        });
    }

    public getCanvasLoading(): Observable<boolean> {
        return this.canvasLoading$.asObservable();
    }

    public getShaderUniforms(): Observable<{ [uniform: string]: IUniform<any>; }> {
        return this.shaderUniforms$.asObservable();
    }

    public updateShaderUniform(uniformName: string, value: any): void {
        if (this.material.uniforms[uniformName]) {
            this.material.uniforms[uniformName].value = value;
            this.scheduleRender();
        } else {
            console.warn("Unknown uniform: " + uniformName);
        }
    }

    public onDestroy(): void {
        window.removeEventListener("resize", this.onResize);
        this.renderer?.dispose();
    }

    protected onResize = (): void => {
        const bounds = this.canvas.getBoundingClientRect();
        const size = Math.min(bounds.width, bounds.height);

        this.resolution = { x: size, y: size };

        this.camera.aspect = 1;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(size, size);
    }

    protected updateResolutionAndCameraProjection(): void {
        const bounds = this.canvas.getBoundingClientRect();
        const size = Math.min(bounds.width, bounds.height);
        this.resolution = { x: size, y: size };
        this.camera.aspect = 1;
        this.camera.updateProjectionMatrix();
    }

    public async exportAsRaw16(): Promise<void> {
        this.setCanvasLoading(true);
        await exportAsRaw16(
            this.getOutputResolution(),
            this.renderer,
            this.scene,
            this.camera,
            this.material
        );
        this.scheduleRender();
        this.setCanvasLoading(false);
    }

    public async exportAsPng(): Promise<void> {
        this.setCanvasLoading(true);
        await exportAsPng8(
            this.getOutputResolution(),
            this.renderer,
            this.scene,
            this.camera,
            this.material
        );
        this.scheduleRender();
        this.setCanvasLoading(false);
    }

    public getOutputResolution(): IVector2 {
        return this.outputResolution$.value;
    }

    public updateOutputResolution(res: IVector2): void {
        return this.outputResolution$.next(res);
    }

    protected setCanvasLoading(loading: boolean): void {
        this.canvasLoading$.next(loading);
    }

    protected scheduleRender(): void {
        this.shaderUniforms$.next(this.material.uniforms);

        if (!this.renderPending) {
            this.renderPending = true;
            requestAnimationFrame(() => {
                this.renderer.render(this.scene, this.camera);
                this.renderPending = false;
            });
        }
    }

}