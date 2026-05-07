varying vec2 vUv; 

 vec4 encodeHeight(float h) {
    h = clamp(h, 0.0, 1.0);

    vec4 enc;
    enc.r = h;
    enc.g = fract(h * 255.0);
    enc.b = fract(h * 65535.0);
    enc.a = fract(h * 16777215.0);

    return enc;
}

void main() {
    vec2 uv = vUv;

    vec4 heightmap = Heightmap(uv);
    vec4 unpacked = unpack4(heightmap.a);

    vec4 include = vec4(SHOW_RED_CHANNEL, SHOW_GREEN_CHANNEL, SHOW_BLUE_CHANNEL, SHOW_ALPHA_CHANNEL);

    vec4 col = vec4(0., 0., 0., 1.);

    if (SHOW_RED_CHANNEL > 0.) {
        col.r = unpacked.r;
    }
    if (SHOW_GREEN_CHANNEL > 0.) {
        col.g = unpacked.g;
    }
    if (SHOW_BLUE_CHANNEL > 0.) {
        col.b = unpacked.b;
    }

    if (SHOW_ALPHA_CHANNEL > 0.) {
        gl_FragColor = vec4(unpacked.a, unpacked.a, unpacked.a, 1.0);
        return;
    }
    
    if (COMBINE_DATA_CHANNELS > 0.) {
        float r = SHOW_RED_CHANNEL > 0. ? unpacked.r : 1.;
        float g = SHOW_GREEN_CHANNEL > 0. ? unpacked.g : 1.;

        col.rgb = vec3(r * g);
    }
    
    gl_FragColor = col;
}