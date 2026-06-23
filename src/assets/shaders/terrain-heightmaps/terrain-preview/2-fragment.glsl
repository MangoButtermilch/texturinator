varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
    vec2 uv = vUv;
    vec3 dx = dFdx(vWorldPos);
    vec3 dy = dFdy(vWorldPos);

    vec3 normal = normalize(cross(dx, dy));

    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));

    float diffuse = max(dot(normal, lightDir), 0.0);

    gl_FragColor = vec4(vec3(diffuse), 1.0);
}