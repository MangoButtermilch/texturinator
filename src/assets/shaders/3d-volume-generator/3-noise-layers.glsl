void evaluateNoiselayerData(
    vec4 noiseLayerData,
    out float noiseScale,
    out float noisePower,
    out float angleOffset,
    out int noiseType) {
    
    noiseScale = noiseLayerData.x;
    noisePower = noiseLayerData.y;
    angleOffset = noiseLayerData.z;
    noiseType = int(noiseLayerData.w);

}

void noiseLayer(
    vec4 noiseLayerData,//x = scale, y = power, z = angle offset, w = noise type
    vec3 noiseSamplePosition,
    float positionDistortion,
    float depth,
    bool invert,
    bool enabled,
    out float value) {

    
    if(!enabled) {
        value = 1.;
        return;
    }

    float distortionStrength = 0.1 * positionDistortion;
    if(distortionStrength > 0.) {
        float noiseDistortion = cnoise(distortionStrength * noiseSamplePosition);//perlin noise
        noiseSamplePosition += vec3(noiseDistortion);
    }


    float noiseScale, noisePower, angleOffset;
    int noiseType;
    evaluateNoiselayerData(noiseLayerData, noiseScale, noisePower, angleOffset, noiseType);

    float sampledNoiseValue = 0.;
    switch(noiseType) {
        case 0: {
            sampledNoiseValue = cnoise(noiseSamplePosition * noiseScale);
            break;
        }
        case 1: {
            sampledNoiseValue = snoise(noiseSamplePosition * noiseScale);
            break;
        }
        case 2: {
            sampledNoiseValue = voronoi(noiseSamplePosition * noiseScale, angleOffset, noiseScale);
            break;
        }
        case 3: {
            sampledNoiseValue = nebulaNoise(noiseSamplePosition * noiseScale);
            break;
        }
    }


    value = clamp(sampledNoiseValue, 0., 1.);
    if (invert) {
        value = 1. - sampledNoiseValue;
    }

    noisePower = abs(noisePower);
    value = pow(value, noisePower);

}