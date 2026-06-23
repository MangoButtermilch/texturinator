varying vec2 vUv;
varying vec3 vWorldPos;

uniform float time;

vec4 encodeHeight(float h) {
    h = clamp(h, 0.0, 1.0);

    vec4 enc;
    enc.r = h;
    enc.g = fract(h * 255.0);
    enc.b = fract(h * 65535.0);
    enc.a = fract(h * 16777215.0);

    return enc;
}


void main()
{
    vUv = uv;

    vec3 pos = position;

    
    float heightmap = clamp(Heightmap(uv).r, 0. ,1.);
    pos.z +=  heightmap * 0.1 * previewHeightScale;
    

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;

    gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(pos, 1.0);
}