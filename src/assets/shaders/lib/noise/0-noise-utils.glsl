/*
* All functions from https://github.com/JimmyCushnie/Noisy-Nodes and translated into GLSL
*/

vec4 modVec4(vec4 x, vec4 y) {
    return x - y * floor(x / y);
}

vec3 modVec3(vec3 x, vec3 y) {
    return x - y * floor(x / y);
}

vec2 mod289(vec2 x) {
    return x - floor(x / 289.0) * 289.0;
}

vec3 mod289(vec3 x) {
    return x - floor(x / 289.0) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x / 289.0) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

vec3 permute(vec3 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
    return vec4(1.79284291400159) - r * 0.85373472095314;
}

vec3 taylorInvSqrt(vec3 r) {
    return vec3(1.79284291400159) - r * 0.85373472095314;
}

vec3 fade(vec3 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float rand3dTo1d(vec3 value, vec3 dotDir) {
    vec3 smallValue = sin(value);
    float random = dot(smallValue, dotDir);
    random = fract(sin(random) * 143758.5453);
    return random;
}

float rand3dTo1d(vec3 value) {
    return rand3dTo1d(value, vec3(12.9898, 78.233, 37.719));
}

float rand2dTo1d(vec2 value, vec2 dotDir) {
    vec2 smallValue = sin(value);
    float random = dot(smallValue, dotDir);
    random = fract(sin(random) * 143758.5453);
    return random;
}

float rand2dTo1d(vec2 value) {
    return rand2dTo1d(value, vec2(12.9898, 78.233));
}

float rand1dTo1d(float value, float mutator) {
    float random = fract(sin(value + mutator) * 143758.5453);
    return random;
}

float rand1dTo1d(float value) {
    return rand1dTo1d(value, 0.546);
}

vec2 rand3dTo2d(vec3 value) {
    return vec2(
        rand3dTo1d(value, vec3(12.989, 78.233, 37.719)),
        rand3dTo1d(value, vec3(39.346, 11.135, 83.155))
    );
}

vec2 rand2dTo2d(vec2 value) {
    return vec2(
        rand2dTo1d(value, vec2(12.989, 78.233)),
        rand2dTo1d(value, vec2(39.346, 11.135))
    );
}

vec2 rand1dTo2d(float value) {
    return vec2(
        rand1dTo1d(value, 3.9812),
        rand1dTo1d(value, 7.1536)
    );
}

vec3 rand3dTo3d(vec3 value) {
    return vec3(
        rand3dTo1d(value, vec3(12.989, 78.233, 37.719)),
        rand3dTo1d(value, vec3(39.346, 11.135, 83.155)),
        rand3dTo1d(value, vec3(73.156, 52.235, 9.151))
    );
}

vec3 rand2dTo3d(vec2 value) {
    return vec3(
        rand2dTo1d(value, vec2(12.989, 78.233)),
        rand2dTo1d(value, vec2(39.346, 11.135)),
        rand2dTo1d(value, vec2(73.156, 52.235))
    );
}

vec3 rand1dTo3d(float value) {
    return vec3(
        rand1dTo1d(value, 3.9812),
        rand1dTo1d(value, 7.1536),
        rand1dTo1d(value, 5.7241)
    );
}
