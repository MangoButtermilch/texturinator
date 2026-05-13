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
