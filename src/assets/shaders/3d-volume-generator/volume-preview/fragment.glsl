precision highp float;

uniform vec3 cameraPos;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform int maxSteps;
uniform float stepSize;
uniform float densityMult;

varying vec2 vUv;
varying vec3 vPosition;

bool intersectBox(vec3 ro, vec3 rd, out float tNear, out float tFar) {
    vec3 boxMin = vec3(-0.5);
    vec3 boxMax = vec3(0.5);
    vec3 t1 = (boxMin - ro) / rd;
    vec3 t2 = (boxMax - ro) / rd;
    vec3 tMin = min(t1, t2);
    vec3 tMax = max(t1, t2);
    tNear = max(max(tMin.x, tMin.y), tMin.z);
    tFar  = min(min(tMax.x, tMax.y), tMax.z);
    return tNear <= tFar;
}

float sampleVolume(vec3 p)
{
    vec3 noisePos = (p * 0.5 + 0.5) + positionOffset ; 

    vec2 uv = noisePos.xy;

    vec2 uvTwirl;
    twirlUv(uv, vec2(0.5), cellTwirlStrength, vec2(0.0), uvTwirl);

    vec2 uvSpherize;
    spherizeUv(uvTwirl, vec2(0.5), vec2(cellSpherizeStrength), vec2(0.0), uvSpherize);

    vec2 uvShear;
    shearUv(uvSpherize, vec2(0.5), vec2(cellRadialShearStrength), vec2(0.0), uvShear);

    vec3 finalPos = vec3(uvShear.xy, noisePos.z + depth);

    vec4 sampled = vec4(0.0);

    noiseLayer(noiseLayer1, finalPos, noiseLayerDistortion.x, 1.0,
               noiseLayerInverted.x > 0., noiseLayerEnabled.x > 0., sampled.x);

    noiseLayer(noiseLayer2, finalPos, noiseLayerDistortion.y, 1.0,
               noiseLayerInverted.y > 0., noiseLayerEnabled.y > 0., sampled.y);

    noiseLayer(noiseLayer3, finalPos, noiseLayerDistortion.z, 1.0,
               noiseLayerInverted.z > 0., noiseLayerEnabled.z > 0., sampled.z);

    noiseLayer(noiseLayer4, finalPos, noiseLayerDistortion.w, 1.0,
               noiseLayerInverted.w > 0., noiseLayerEnabled.w > 0., sampled.w);

    float density = sampled.x + sampled.y + sampled.z + sampled.w;
    density = pow(density, 2.0) * totalBrightness;

    return density;
}


void main() {
    
    vec2 uv = vUv * 2.0 - 1.0; 
    vec4 rayClip = vec4(uv, -1.0, 1.0);
    vec4 rayEye = inverse(projectionMatrix) * rayClip;
    rayEye.z = -1.0; rayEye.w = 0.0;

    vec3 rd = normalize((inverse(modelViewMatrix) * rayEye).xyz);
    vec3 ro = cameraPos;

    float t0, t1;
    if (!intersectBox(ro, rd, t0, t1)) discard;

    float t = max(t0, 0.0);

    vec3 accColor = vec3(0.0);
    float accAlpha = 0.0;

    for (int i = 0; i < maxSteps; i++) {
        if (t > t1 || accAlpha >= 0.99) break;

        vec3 pos = ro + rd * t;
        float density = max(sampleVolume(pos) * densityMult, 0.0);
        float alpha = density * stepSize;

        // Over blending
        accColor += (1.0 - accAlpha) * alpha * vec3(1.0); 
        accAlpha += (1.0 - accAlpha) * alpha;

        t += stepSize;
    }

    gl_FragColor = vec4(accColor, accAlpha);
}
