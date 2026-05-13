varying vec2 vUv; 

float height(vec2 uv) {
    return texture2D(imageTexture, uv).r;
}

void main() {
    vec2 uv = vUv;
    vec2 texel = 1.0 / imageSize;

    float hL = height(vUv - vec2(texel.x, 0.0));
    float hR = height(vUv + vec2(texel.x, 0.0));
    float hD = height(vUv - vec2(0.0, texel.y));
    float hU = height(vUv + vec2(0.0, texel.y));

    vec3 normal = normalize(vec3(
        (hL - hR) * strength,
        (hD - hU) * strength,
        1.0
    ));

    normal = normal * 0.5  + 0.5;

    gl_FragColor = vec4(normal , 1.0);
}