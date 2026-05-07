varying vec2 vUv; 


void main() {
    vec2 uv = vUv;

    float cellMask;
    vec3 noisePosition;

    createPseudoVolumePosition(uv, cellMask, noisePosition);


    vec3 noiseSamplePosition;
    modify_UV_for_NoiseSamplePosition(noisePosition, noiseSamplePosition);
    vec4 sampledNoises = vec4(1.);


    noiseLayer(
        noiseLayer1,
        noiseSamplePosition, 
        noiseLayerDistortion.x,
        1.,
        noiseLayerInverted.x > 0. ? true : false,
        noiseLayerEnabled.x > 0. ? true : false,
        sampledNoises.x
    );
    noiseLayer(
        noiseLayer2,
        noiseSamplePosition, 
        noiseLayerDistortion.y,
        1.,
        noiseLayerInverted.y > 0. ? true : false,
        noiseLayerEnabled.y > 0. ? true : false,
        sampledNoises.y
    );
    noiseLayer(
        noiseLayer3,
        noiseSamplePosition, 
        noiseLayerDistortion.z,
        1.,
        noiseLayerInverted.z > 0. ? true : false,
        noiseLayerEnabled.z > 0. ? true : false,
        sampledNoises.z
    );
    noiseLayer(
        noiseLayer4,
        noiseSamplePosition, 
        noiseLayerDistortion.w,
        1.,
        noiseLayerInverted.w > 0. ? true : false,
        noiseLayerEnabled.w > 0. ? true : false,
        sampledNoises.w
    );

    float noiseValueTotal = 
        sampledNoises.x + sampledNoises.y + sampledNoises.z + sampledNoises.w;  
    //reduce brightness
    noiseValueTotal = pow(noiseValueTotal, 2.) * totalBrightness;

    float noiseValueTotalMask = 
        sampledNoises.x * sampledNoises.y * sampledNoises.z * sampledNoises.w * cellMask;

    noiseValueTotal *= noiseValueTotalMask;


    gl_FragColor = vec4(noiseValueTotal, noiseValueTotal, noiseValueTotal, 1.0);
}