/*
* All functions from https://github.com/JimmyCushnie/Noisy-Nodes and translated into GLSL
*/

vec3 voronoi_noise_randomVector(vec3 UV, float offset) {
    mat3 m = mat3(
        15.27, 47.63, 99.41,
        89.98, 95.07, 38.39,
        33.83, 51.06, 60.77
    );
    UV = fract(sin(m * UV) * 46839.32);
    return vec3(
        sin(UV.y + offset) * 0.5 + 0.5,
        cos(UV.x * offset) * 0.5 + 0.5,
        sin(UV.z * offset) * 0.5 + 0.5
    );
}

void VoronoiPrecise3D(vec3 UV, float AngleOffset, float CellDensity, out float Out, out float Cells) {
    vec3 g = floor(UV * CellDensity);
    vec3 f = fract(UV * CellDensity);
    vec2 res = vec2(8.0, 8.0);
    vec3 ml = vec3(0.0);
    vec3 mv = vec3(0.0);

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            for (int z = -1; z <= 1; z++) {
                vec3 lattice = vec3(x, y, z);
                vec3 offset = voronoi_noise_randomVector(g + lattice, AngleOffset);
                vec3 v = lattice + offset - f;
                float d = dot(v, v);

                if (d < res.x) {
                    res.x = d;
                    res.y = offset.x;
                    mv = v;
                    ml = lattice;
                }
            }
        }
    }

    Cells = res.y;

    res = vec2(8.0, 8.0);

    for (int y1 = -2; y1 <= 2; y1++) {
        for (int x1 = -2; x1 <= 2; x1++) {
            for (int z1 = -2; z1 <= 2; z1++) {
                vec3 lattice = ml + vec3(x1, y1, z1);
                vec3 offset = voronoi_noise_randomVector(g + lattice, AngleOffset);
                vec3 v = lattice + offset - f;

                vec3 cellDifference = abs(ml - lattice);
                if (cellDifference.x + cellDifference.y + cellDifference.z > 0.1) {
                    float d = dot(0.5 * (mv + v), normalize(v - mv));
                    res.x = min(res.x, d);
                }
            }
        }
    }

    Out = res.x;
}

void Voronoi3D(vec3 UV, float AngleOffset, float CellDensity, out float Out, out float Cells) {
    vec3 g = floor(UV * CellDensity);
    vec3 f = fract(UV * CellDensity);
    vec3 res = vec3(8.0);

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            for (int z = -1; z <= 1; z++) {
                vec3 lattice = vec3(x, y, z);
                vec3 offset = voronoi_noise_randomVector(g + lattice, AngleOffset);
                vec3 v = lattice + offset - f;
                float d = dot(v, v);

                if (d < res.x) {
                    res.y = res.x;
                    res.x = d;
                    res.z = offset.x;
                } else if (d < res.y) {
                    res.y = d;
                }
            }
        }
    }

    Out = res.x;
    Cells = res.z;
}

float voronoi(vec3 UV, float AngleOffset, float CellDensity) {
    vec3 g = floor(UV * CellDensity);
    vec3 f = fract(UV * CellDensity);
    vec3 res = vec3(8.0);

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            for (int z = -1; z <= 1; z++) {
                vec3 lattice = vec3(x, y, z);
                vec3 offset = voronoi_noise_randomVector(g + lattice, AngleOffset);
                vec3 v = lattice + offset - f;
                float d = dot(v, v);

                if (d < res.x) {
                    res.y = res.x;
                    res.x = d;
                    res.z = offset.x;
                } else if (d < res.y) {
                    res.y = d;
                }
            }
        }
    }

    return res.x;
}
