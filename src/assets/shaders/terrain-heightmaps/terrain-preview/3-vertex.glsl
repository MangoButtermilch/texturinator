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

    
    vec4 heightmap = Heightmap(uv);
    vec4 unpacked = unpack4(heightmap.a);

    vec4 include = vec4(SHOW_RED_CHANNEL, SHOW_GREEN_CHANNEL, SHOW_BLUE_CHANNEL, SHOW_ALPHA_CHANNEL);

    vec4 col = vec4(0., 0., 0., 1.);
    float height = 0.0;

    if (COMBINE_DATA_CHANNELS > 0.) {
        float r = SHOW_RED_CHANNEL > 0. ? unpacked.r : 1.0;
        float g = SHOW_GREEN_CHANNEL > 0. ? unpacked.g : 1.0;

        height = r * g;

    } else {

        if (SHOW_RED_CHANNEL > 0.) {
            height = unpacked.r;
        } else if (SHOW_GREEN_CHANNEL > 0.) {
            height = unpacked.g;
        } else if (SHOW_BLUE_CHANNEL > 0.) {
            height = unpacked.b;
        } else if (SHOW_ALPHA_CHANNEL > 0.) {
            height = unpacked.a;
        }
    }

    pos.z += height * 0.001 * previewHeightScale;
    

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;

    gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(pos, 1.0);
}