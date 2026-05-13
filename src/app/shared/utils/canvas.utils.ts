
import * as THREE from 'three';
import { IVector2 } from '../../features/3d-volumes/interfaces/shader-configs.interfaces';

export interface CanvasSetup {
    canvas: HTMLCanvasElement
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer
    resolution: IVector2
}

export async function exportAsRaw16(
    resolution: IVector2,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    material: THREE.ShaderMaterial
): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {
            const renderTarget = new THREE.WebGLRenderTarget(resolution.x, resolution.y, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: THREE.FloatType
            });

            const originalSize = new THREE.Vector2();
            renderer.getSize(originalSize);
            const originalRenderTarget = renderer.getRenderTarget();

            const originalColorSpace = renderer.outputColorSpace;
            const originalToneMapping = renderer.toneMapping;
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.NoToneMapping;

            renderer.setRenderTarget(renderTarget);
            renderer.setSize(resolution.x, resolution.y);
            material.uniforms['resolution'].value.set(resolution.x, resolution.y);
            renderer.render(scene, camera);

            const buffer = new Float32Array(resolution.x * resolution.y * 4);
            renderer.readRenderTargetPixels(renderTarget, 0, 0, resolution.x, resolution.y, buffer);

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

            renderer.outputColorSpace = originalColorSpace;
            renderer.toneMapping = originalToneMapping;
            renderer.setRenderTarget(originalRenderTarget);
            renderer.setSize(originalSize.x, originalSize.y);
            material.uniforms['resolution'].value.set(originalSize.x, originalSize.y);

            renderTarget.dispose();
            resolve();
        }, 100);
    });
}

/**
 * Export and download canvas as 8 bit png.
 * @param resolution 
 * @param renderer 
 * @param scene 
 * @param camera 
 * @param material 
 */
export async function exportAsPng8(
    resolution: IVector2,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    material: THREE.ShaderMaterial
): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {

            const renderTarget = new THREE.WebGLRenderTarget(resolution.x, resolution.y, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat
            });

            const originalSize = new THREE.Vector2();
            renderer.getSize(originalSize);
            const originalRenderTarget = renderer.getRenderTarget();

            renderer.setRenderTarget(renderTarget);
            renderer.setSize(resolution.x, resolution.y);
            material.uniforms['resolution'].value.set(resolution.x, resolution.y);
            renderer.render(scene, camera);

            const buffer = new Uint8Array(resolution.x * resolution.y * 4);
            renderer.readRenderTargetPixels(renderTarget, 0, 0, resolution.x, resolution.y, buffer);

            const exportCanvas = document.createElement("canvas");
            exportCanvas.width = resolution.x;
            exportCanvas.height = resolution.y;
            const ctx = exportCanvas.getContext("2d");

            const imageData = ctx.createImageData(resolution.x, resolution.y);
            imageData.data.set(buffer);

            //webgl texture specific
            ctx.putImageData(flipImageDataY(imageData), 0, 0);

            exportCanvas.toBlob((blob) => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "heightmap.png";
                a.click();
            }, "image/png");

            renderer.setRenderTarget(originalRenderTarget);
            renderer.setSize(originalSize.x, originalSize.y);
            material.uniforms['resolution'].value.set(originalSize.x, originalSize.y);
            renderTarget.dispose();

            resolve();
        }, 100);
    });
}

export function flipImageDataY(imageData: ImageData): ImageData {
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