/**
==============================

Implementation and code by Rune Skovbo Johansen.
Sources:
- Blog post https://blog.runevision.com/2026/03/fast-and-gorgeous-erosion-filter.html
- Youtube video https://www.youtube.com/watch?v=r4V21_uUK8Y
- Shadertoy https://www.shadertoy.com/view/wXcfWn
==============================
*/

#define clamp01(x) clamp(x, 0.0, 1.0)

vec2 hash(in vec2 x) {
    const vec2 k = vec2(0.3183099, 0.3678794);
    x = x * k + k.yx;
    return -1.0 + 2.0 * fract(16.0 * k * fract(x.x * x.y * (x.x + x.y)));
}

// Returns gradient noise (in x) and its derivatives (in yz).
// From https://www.shadertoy.com/view/XdXBRH
vec3 noised(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0); 
    
    vec2 ga = hash(i + vec2(0.0, 0.0));
    vec2 gb = hash(i + vec2(1.0, 0.0));
    vec2 gc = hash(i + vec2(0.0, 1.0));
    vec2 gd = hash(i + vec2(1.0, 1.0));
    
    float va = dot(ga, f - vec2(0.0, 0.0));
    float vb = dot(gb, f - vec2(1.0, 0.0));
    float vc = dot(gc, f - vec2(0.0, 1.0));
    float vd = dot(gd, f - vec2(1.0, 1.0));

    return vec3(va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * (va - vb - vc + vd),
        ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) +
        du * (u.yx * (va - vb - vc + vd) + vec2(vb, vc) - va));
}

// ------------------------------------------------------------------------------
// Packing
// ------------------------------------------------------------------------------

// Some methods to package colours from a vec4 (0-1) into a single 32-bit float.
float pack4(in vec4 rgba) {
    lowp int red = clamp(int(rgba.r * 255.0), 0, 255);
    lowp int green = clamp(int(rgba.g * 255.0), 0, 255);
    lowp int blue = clamp(int(rgba.b * 255.0), 0, 255);
    lowp int alpha = clamp(int(rgba.a * 255.0), 0, 255);

    return intBitsToFloat((red << 24) | (green << 16) | (blue << 8) | alpha);
}

vec4 unpack4(in float col) {
    highp int val = floatBitsToInt(col);

    return vec4(
        float((val >> 24) & 255) / 255.0,
        float((val >> 16) & 255) / 255.0,
        float((val >> 8) & 255) / 255.0,
        float(val & 255) / 255.0
    );
}

// -----------------------------------------------------------------------------
// PHACELLE NOISE FUNCTION
// -----------------------------------------------------------------------------

// NOTE: Phacelle Noise depends on the 'hash' function defined in the Common tab.

#define TAU 6.28318530717959

// The Simple Phacelle Noise function produces a stripe pattern aligned with the input vector.
// The name Phacelle is a portmanteau of phase and cell, since the function produces a phase by
// interpolating cosine and sine waves from multiple cells.
//  - p is the input point being evaluated.
//  - normDir is the direction of the stripes at this point. It must be a normalized vector.
//  - freq is the freqency of the stripes within each cell. It's best to keep it close to 1.0, as
//    high values will produce distortions and other artifacts.
//  - offset is the phase offset of the stripes, where 1.0 is a full cycle.
//  - normalization is the degree of normalization applied, between 0 and 1. With e.g. a value of
//    0.4, raw output with a magnitude below 0.6 won't get fully normalized to a magnitude of 1.0.
// Phacelle Noise function copyright (c) 2025 Rune Skovbo Johansen
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
vec4 PhacelleNoise(in vec2 p, vec2 normDir, float freq, float offset, float normalization) {
    // Get a vector orthogonal to the input direction, with a
    // magnitude proportional to the frequency of the stripes.
    vec2 sideDir = normDir.yx * vec2(-1.0, 1.0) * freq * TAU;
    offset *= TAU;

    // Iterate over 4x4 cells, calculating a stripe pattern for each and blending between them.
    // pInt is the integer part of the current coordinate p, pFrac is the remainder.
    //
    // o   o   o   o
    //
    // o   o   o   o
    //       p
    // o   i   o   o
    //
    // o   o   o   o
    //
    // p: current coordinate    i: integer part of p    o: grid points for 4x4 cells
    //
    vec2 pInt = floor(p);
    vec2 pFrac = fract(p);
    vec2 phaseDir = vec2(0.0);
    float weightSum = 0.0;
    for (int i = -1; i <= 2; i++) {
        for (int j = -1; j <= 2; j++) {
            vec2 gridOffset = vec2(i, j);

            // Calculate a cell point by starting off with a point in the integer grid.
            vec2 gridPoint = pInt + gridOffset;

            // Calculate a random offset for the cell point between -0.5 and 0.5 on each axis.
            vec2 randomOffset = hash(gridPoint) * 0.5;

            // The final cell point (we don't store it) is the gridPoint plus the randomOffset.
            // Calculate a vector representing the input point relative to this cell point:
            // p - (gridPoint + randomOffset)
            // = (pFrac + pInt) - ((pInt + gridOffset) + randomOffset)
            // = pFrac + pInt - pInt - gridOffset - randomOffset
            // = pFrac - gridOffset - randomOffset
            vec2 vectorFromCellPoint = pFrac - gridOffset - randomOffset;

            // Bell-shaped weight function which is 1 at dist 0 and nearly 0 at dist 1.5.
            // Due to the random offsets of up to 0.5, the closest a cell point not in the 4x4
            // grid can be to the current point p is 1.5 units away.
            float sqrDist = dot(vectorFromCellPoint, vectorFromCellPoint);
            float weight = exp(-sqrDist * 2.0);
            // Subtract 0.01111 to make the function actually 0 at distance 1.5, which avoids
            // some (very subtle) grid line artefacts.
            weight = max(0.0, weight - 0.01111);

            // Keep track of the total sum of weights.
            weightSum += weight;

            // The waveInput is a gradient which increases in value along sideDir. Its rate of
            // change is the freq times tau, due to the multiplier pre-applied to sideDir.
            float waveInput = dot(vectorFromCellPoint, sideDir) + offset;

            // Add this cell's cosine and sine wave contributions to the interpolated value.
            phaseDir += vec2(cos(waveInput), sin(waveInput)) * weight;
        }
    }

    // Get the raw interpolated value.
    vec2 interpolated = phaseDir / weightSum;
    // Interpret the value as a vector whose length represents the magnitude of both waves.
    float magnitude = sqrt(dot(interpolated, interpolated));
    // Apply a lower threshold to show small magnitudes we're going to fully normalize.
    magnitude = max(1.0 - normalization, magnitude);
    // Return a vector containing the normalized cosine and sine waves, as well as the direction
    // vector, which can be multiplied onto the sine to get the derivatives of the cosine.
    return vec4(interpolated / magnitude, sideDir);
}


// -----------------------------------------------------------------------------
// EROSION FUNCTION
// -----------------------------------------------------------------------------

// First a few utility functions.

float pow_inv(float t, float power) {
    // Flip, raise to the specified power, and flip back.
    return 1.0 - pow(1.0 - clamp01(t), power);
}

float ease_out(float t) {
    // Flip by subtracting from one.
    float v = 1.0 - clamp01(t);
    // Raise to a power of two and flip back.
    return 1.0 - v * v;
}

float smooth_start(float t, float smoothing) {
    if (t >= smoothing)
        return t - 0.5 * smoothing;
    return 0.5 * t * t / smoothing;
}

vec2 safe_normalize(vec2 n) {
 	// A div-by-zero-safe replacement for normalize.
    float l = length(n);
	return (abs(l) > 1e-10) ? (n / l) : n;	
}

// Advanced Terrain Erosion Filter copyright (c) 2025 Rune Skovbo Johansen
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
vec4 ErosionFilter(
    // Input parameters that vary per pixel.
    in vec2 p, vec3 heightAndSlope, float fadeTarget,
    // Stylistic parameters that may vary per pixel.
    float strength, float gullyWeight, float detail, vec4 rounding, vec4 onset, vec2 assumedSlope,
    // Scale related parameters that do not support variation per pixel.
    float scale, int octaves, float lacunarity,
    // Other parameters.
    float gain, float cellScale, float normalization,
    // Output parameters.
    out float ridgeMap, out float debug
) {
    strength *= scale;
    fadeTarget = clamp(fadeTarget, -1.0, 1.0);
    
    vec3 inputHeightAndSlope = heightAndSlope;
    float freq = 1.0 / (scale * cellScale);
    float slopeLength = max(length(heightAndSlope.yz), 1e-10);
    float magnitude = 0.0;
    float roundingMult = 1.0;
    
    float roundingForInput = mix(rounding.y, rounding.x, clamp01(fadeTarget + 0.5)) * rounding.z;
    // The combined accumulating mask, based first on initial slope, and later on slope of each octave too.
    float combiMask = ease_out(smooth_start(slopeLength * onset.x, roundingForInput * onset.x));

    // Initialize the ridgeMap fadeTarget and mask.
    float ridgeMapCombiMask = ease_out(slopeLength * onset.z);
    float ridgeMapFadeTarget = fadeTarget;
    
    // Deteriming the strength of the initial slope used for gully directions
    // based on the specified mix of the actual slope and an assumed slope.
    vec2 gullySlope = mix(heightAndSlope.yz, heightAndSlope.yz / slopeLength * assumedSlope.x, assumedSlope.y);
    
    for (int i = 0; i < octaves; i++) {
        // Calculate and add gullies to the height and slope.
        vec4 phacelle = PhacelleNoise(p * freq, safe_normalize(gullySlope), cellScale, 0.25, normalization);
        // Multiply with freq since p was multiplied with freq.
        // Negate since we use slope directions that point down.
        phacelle.zw *= -freq;
        // Amount of slope as value from 0 to 1.
        float sloping = abs(phacelle.y);
        
        // Add non-masked, normalized slope to gullySlope, for use by subsequent octaves.
        // It's normalized to use the steepest part of the sine wave everywhere.
        gullySlope += sign(phacelle.y) * phacelle.zw * strength * gullyWeight;
        
        // Handle height offset and approximate output slope.
        
        // Gullies has height offset (from -1 to 1) in x and derivative in yz.
        vec3 gullies = vec3(phacelle.x, phacelle.y * phacelle.zw);
        // Fade gullies towards fadeTarget based on combiMask.
        vec3 fadedGullies = mix(vec3(fadeTarget, 0.0, 0.0), gullies * gullyWeight, combiMask);
        // Apply height offset and derivative (slope) according to strength of current octave.
        heightAndSlope += fadedGullies * strength;
        magnitude += strength;
        
        // Update fadeTarget to include the new octave.
        fadeTarget = fadedGullies.x;
        
        // Update the mask to include the new octave.
        float roundingForOctave = mix(rounding.y, rounding.x, clamp01(phacelle.x + 0.5)) * roundingMult;
        float newMask = ease_out(smooth_start(sloping * onset.y, roundingForOctave * onset.y));
        combiMask = pow_inv(combiMask, detail) * newMask;
        
        // Update the ridgeMap fadeTarget and mask.
        ridgeMapFadeTarget = mix(ridgeMapFadeTarget, gullies.x, ridgeMapCombiMask);
        float newRidgeMapMask = ease_out(sloping * onset.w);
        ridgeMapCombiMask = ridgeMapCombiMask * newRidgeMapMask;

        // Prepare the next octave.
        strength *= gain;
        freq *= lacunarity;
        roundingMult *= rounding.w;
    }
    
    ridgeMap = ridgeMapFadeTarget * (1.0 - ridgeMapCombiMask);
    debug = fadeTarget;
    
    vec3 heightAndSlopeDelta = heightAndSlope - inputHeightAndSlope;
    return vec4(heightAndSlopeDelta, magnitude);
}


// -----------------------------------------------------------------------------
// DEMONSTRATION
// -----------------------------------------------------------------------------

// Used for the height map.
vec3 FractalNoise(vec2 p, float freq, int octaves, float lacunarity, float gain) {
    vec3 n = vec3(0.0);
    float nf = freq;
    float na = 1.0;
    for (int i = 0; i < octaves; i++) {
        n += noised(p * nf) * na * vec3(1.0, nf, nf);
        na *= gain;
        nf *= lacunarity;
    }
    return n;
}

vec4 Heightmap(vec2 p) {
    // ------------------------------------------------------------------------
    // Heightmap implementation.
    // ------------------------------------------------------------------------

    float heightFunctionScale = 1.0;
    vec2 pHeight = p / heightFunctionScale;
    
    // Calculate the FBM terrain height and derivatives and store them in n.
    // The heights are in the [-1, 1] range.
    vec3 n = FractalNoise(pHeight, HEIGHT_FREQUENCY, HEIGHT_OCTAVES, HEIGHT_LACUNARITY, HEIGHT_GAIN)
		* HEIGHT_AMP * vec3(heightFunctionScale, 1.0, 1.0);

    // Define the erosion fade target based on the altitude of the pre-eroded terrain.
    // The fade target should strive to be -1 at valleys and 1 at peaks, but overshooting is ok.
    float fadeTarget = clamp(n.x / (HEIGHT_AMP * 0.6), -1.0, 1.0);
    
    // Change terrain heights from [-1, 1] range to [0, 1] range.
    n = n * 0.5 + vec3(0.5, 0, 0);

    // Store erosion in h (x : height delta, yz : slope delta, w : magnitude).
    // The output ridge map is -1 on creases and 1 on ridges.
    // The output debug value can be set to various values inside the erosion function.
    float ridgeMap, debug;
    vec4 h = ErosionFilter(
        p, n, fadeTarget,
        EROSION_STRENGTH, EROSION_GULLY_WEIGHT, EROSION_DETAIL,
        EROSION_ROUNDING, EROSION_ONSET, EROSION_ASSUMED_SLOPE,
        EROSION_SCALE, EROSION_OCTAVES, EROSION_LACUNARITY,
        EROSION_GAIN, EROSION_CELL_SCALE, EROSION_NORMALIZATION,
        ridgeMap, debug);
    
    
    // Offset according to the height offset parameter by multiplying it with the magnitude.
    float offset = mix(TERRAIN_HEIGHT_OFFSET.x, -fadeTarget, TERRAIN_HEIGHT_OFFSET.y) * h.w;
    float eroded = n.x + h.x + offset;

    // Pack four floats into a single channel to be able to get more data out of this buffer.
    float packed = pack4(vec4(
        clamp01(h.x / h.w * 0.5 + 0.5), // Erosion delta as [0, 1] value.
        clamp01(ridgeMap * 0.5 + 0.5),  // Ridge map as [0, 1] value.
        0.0, 
        clamp01(debug * 0.5 + 0.5)      // Debug value.
    ));
    
    return vec4(eroded, 0.0, 0.0, packed);
    
}