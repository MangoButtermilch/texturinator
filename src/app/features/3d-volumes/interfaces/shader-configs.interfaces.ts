import { GuidService } from "../../../core/services/guid.service"

export enum NoiseType {
    PERLIN = "perlin",
    SIMPLEX = "simplex",
    VORONOI = "voronoi",
    NEBULA = "nebula"
}

export interface IVector2 { x: number, y: number };

export interface IVector3 { x: number, y: number, z: number };

export interface IVector4 { x: number, y: number, z: number, w: number };

export interface ShaderConfig {
    totalBrightness: number
    depth: number
    numCells: number
    tilingPerCell: number
    positionOffset: IVector3
    growAndShrinkCells: boolean,
    borderStrength: number,
    centerStrength: number,
    centerRadius: number,
    hideFirstCell: boolean,
    hideLastCell: boolean

    cellSpherizeStrength: number,
    cellRadialShearStrength: number,
    cellTwirlStrength: number,

    noiseLayers: NoiseLayer[],
    noiseLayerDistortion: IVector4,
    noiseLayerEnabled: IVector4,
    noiseLayerInverted: IVector4
}

export interface NoiseLayer {
    id: string,
    title: string,
    uniformName: string,
    scale: number,
    power: number,
    distortion: number,
    noiseType: NoiseType,
    inverted: boolean,
    enabled: boolean,
    angleOffset?: number,
}

export const defaultNoiseLayerConfig: NoiseLayer[] = [
    {
        id: GuidService.new,
        title: "Noise layer 1",
        uniformName: "noiseLayer1",
        noiseType: NoiseType.PERLIN,
        scale: 5.29,
        angleOffset: 0.,
        power: 1.52,
        distortion: 0.4,
        enabled: true,
        inverted: false,
    },
    {
        id: GuidService.new,
        title: "Noise layer 2",
        uniformName: "noiseLayer2",
        noiseType: NoiseType.VORONOI,
        scale: 3.91,
        angleOffset: 13.69,
        power: 0.81,
        distortion: 0.,
        enabled: true,
        inverted: false,
    },
    {
        id: GuidService.new,
        title: "Noise layer 3",
        uniformName: "noiseLayer3",
        noiseType: NoiseType.SIMPLEX,
        scale: 2.12,
        angleOffset: 0.0,
        power: 0.55,
        distortion: 0.,
        enabled: true,
        inverted: false,
    },
    {
        id: GuidService.new,
        title: "Noise layer 4",
        uniformName: "noiseLayer4",
        noiseType: NoiseType.NEBULA,
        scale: 1.15,
        angleOffset: 0.0,
        power: 1.15,
        distortion: 0.,
        enabled: true,
        inverted: false,
    }
];

export const defaultConfig: ShaderConfig = {
    totalBrightness: 1.,
    depth: 0.,
    numCells: 16,
    tilingPerCell: 1.,
    positionOffset: { x: 0, y: 0, z: 0 },
    growAndShrinkCells: false,
    borderStrength: .5,
    centerStrength: .2,
    centerRadius: .3,
    hideFirstCell: false,
    hideLastCell: false,

    cellSpherizeStrength: 0.,
    cellRadialShearStrength: 0.,
    cellTwirlStrength: 0.,
    noiseLayers: defaultNoiseLayerConfig,
    noiseLayerDistortion: { x: 0, y: 0, z: 0, w: 0 },
    noiseLayerEnabled: { x: 1, y: 1, z: 1, w: 1 },
    noiseLayerInverted: { x: 0, y: 0, z: 0, w: 0 },
}
