varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vWorldPos = position;
  gl_Position = vec4(position.xy, 0.0, 1.0); 
}