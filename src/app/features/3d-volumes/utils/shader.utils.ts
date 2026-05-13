import { IVector2, NoiseType, ShaderConfig } from "../interfaces/shader-configs.interfaces";
import * as THREE from 'three';

export function mapIndexToVec4Component(index: number): string {
    switch (index) {
        case 0: return "x";
        case 1: return "y";
        case 2: return "z";
        case 3: return "w";
    }
    throw new Error("Invalid index");
}

export function noiseTypeToId(noiseType: NoiseType) {
    switch (noiseType) {
        case NoiseType.PERLIN: return 0;
        case NoiseType.SIMPLEX: return 1;
        case NoiseType.VORONOI: return 2;
        case NoiseType.NEBULA: return 3;
        default: throw Error("Invalid noise type " + noiseType);
    }
}

export function setupShaderUniforms(
    resolution: IVector2,
    material: THREE.ShaderMaterial,
    config: ShaderConfig): void {
    material.uniforms = {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2(resolution.x, resolution.y) },
        totalBrightness: { value: config.totalBrightness },
        depth: { value: config.depth },
        numCells: { value: config.numCells },
        tilingPerCell: { value: config.tilingPerCell },
        positionOffset: {
            value: new THREE.Vector3(
                config.positionOffset.x,
                config.positionOffset.y,
                config.positionOffset.z
            )
        },
        growAndShrinkCells: { value: config.growAndShrinkCells },
        borderStrength: { value: config.borderStrength },
        centerStrength: { value: config.centerStrength },
        centerRadius: { value: config.centerRadius },
        hideFirstCell: { value: config.hideFirstCell },
        hideLastCell: { value: config.hideLastCell },
        cellTwirlStrength: { value: config.cellTwirlStrength },
        cellSpherizeStrength: { value: config.cellSpherizeStrength },
        cellRadialShearStrength: { value: config.cellRadialShearStrength },
        noiseLayerDistortion: {
            value: new THREE.Vector4(
                config.noiseLayerDistortion.x,
                config.noiseLayerDistortion.y,
                config.noiseLayerDistortion.z,
                config.noiseLayerDistortion.w,
            )
        },
        noiseLayerEnabled: {
            value: new THREE.Vector4(
                config.noiseLayerDistortion.x,
                config.noiseLayerDistortion.y,
                config.noiseLayerDistortion.z,
                config.noiseLayerDistortion.w,
            )
        },
        noiseLayerInverted: {
            value: new THREE.Vector4(
                config.noiseLayerDistortion.x,
                config.noiseLayerDistortion.y,
                config.noiseLayerDistortion.z,
                config.noiseLayerDistortion.w,
            )
        }
    };

    for (let i = 0; i < config.noiseLayers.length; i++) {
        const uniformName = `noiseLayer${i + 1}`;
        const noiseLayer = config.noiseLayers[i];
        const type = noiseTypeToId(noiseLayer.noiseType);

        const vector = new THREE.Vector4(
            noiseLayer.scale,
            noiseLayer.power,
            noiseLayer.angleOffset ?? 0,
            type
        );

        if (!material.uniforms[uniformName]) {
            material.uniforms[uniformName] = { value: vector };
        } else {
            material.uniforms[uniformName].value = vector;
        }

        const distortion = noiseLayer.distortion;
        const vectorComponent = mapIndexToVec4Component(i);
        config.noiseLayerDistortion[vectorComponent] = distortion;
        config.noiseLayerEnabled[vectorComponent] = noiseLayer.enabled;
        config.noiseLayerInverted[vectorComponent] = noiseLayer.inverted;

        material.uniforms['noiseLayerDistortion'].value = new THREE.Vector4(
            config.noiseLayerDistortion.x,
            config.noiseLayerDistortion.y,
            config.noiseLayerDistortion.z,
            config.noiseLayerDistortion.w,
        );
        material.uniforms['noiseLayerEnabled'].value = new THREE.Vector4(
            config.noiseLayerEnabled.x,
            config.noiseLayerEnabled.y,
            config.noiseLayerEnabled.z,
            config.noiseLayerEnabled.w,
        );
        material.uniforms['noiseLayerInverted'].value = new THREE.Vector4(
            config.noiseLayerInverted.x,
            config.noiseLayerInverted.y,
            config.noiseLayerInverted.z,
            config.noiseLayerInverted.w,
        );
    }


    material.needsUpdate = true;
}