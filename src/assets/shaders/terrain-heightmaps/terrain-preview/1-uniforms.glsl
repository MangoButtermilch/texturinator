 /**
==============================

Implementation and code by Rune Skovbo Johansen.
Sources:
- Blog post https://blog.runevision.com/2026/03/fast-and-gorgeous-erosion-filter.html
- Youtube video https://www.youtube.com/watch?v=r4V21_uUK8Y
- Shadertoy https://www.shadertoy.com/view/wXcfWn
==============================
*/

// The scale of the erosion effect, affecting it both horizontally and vertically.
uniform float EROSION_SCALE;

// The strength of the erosion effect, affecting the magnitude of all octaves,
// and indirectly affecting the directions of the gullies as a result.
uniform float EROSION_STRENGTH;

// The magnitude of the gullies as a weight value from 0 to 1.
// A value of 0 can sharpen peaks and valleys but feature virtually no gullies.
// A value of 1 produces full gullies but may leave peaks and valleys rounded.
// Adjusting erosion gully weight while inversely adjusting erosion scale can be
// used to control the sharpness of peaks and valleys while leaving gully
// magnitudes largely untocuhed.
uniform float EROSION_GULLY_WEIGHT;

// The overall detail of the erosion. Lower values restrict the effect of higher
// frequency gullies to steeper slopes.
uniform float EROSION_DETAIL;

uniform float ridgeRounding;
uniform float creaseRounding;

// Separate rounding control of ridges and creases.
//  x: Rounding of ridges.
//  y: Rounding of creases.
//  z: Multiplier applied to the initial height function.
//     E.g. if the height function has noise of 5 times lower frequency
//     than the largest gullies, a value of 0.2 can compensate for that.
//  w: Multiplier applied to each subsequent gully octave after the first.
//     Setting it to the same value as the erosion lacunarity will produce
//     consistent rounding of all octaves.
uniform vec4 EROSION_ROUNDING;

// Control over how far away from ridges/creases the erosion takes effect.
//  x: Onset used on the initial height function.
//  y: Onset used on each gully octave.
//  z: RidgeMap-specific onset used on the initial height function.
//  w: RidgeMap-specific onset used on each gully octave.
uniform vec4 EROSION_ONSET;

// Control over the assumed slope of the initial height function.
// In practise, assuming a slope can work better than using the input slope,
// since the final terrain can be shaped quite differently than the input.
//  x: An assumed slope value to override the actual slope.
//  y: The amount (from 0 to 1) to override the actual slope.
uniform vec2 EROSION_ASSUMED_SLOPE;

// Gullies are based on stripes within Voronoi-like cells in the Phacelle noise
// function. The cell scale parameter controls the sizes of the cells relative
// to the overall erosion scale, while keeping the stripe widths unaffected.
// Values close to 1 usually produce good results. Smaller values produce more
// grainy gullies while larger values produce longer unbroken gullies, but too
// large values produce chaotic curved gullies that are not aligned with the
// slopes. Value changes can cause abrupt changes in output, especially far away
// from the origin, so this parameter is not well suited for animation or for
// modulation by other functions.
uniform float EROSION_CELL_SCALE;
// The degree of normalization applied in the Phacelle noise, between 0 and 1.
// The erosion filter depends on a certain consistency in magnitude of the
// Phacelle output. However, high values can create loopy results where ridges
// and creases meet up at a point, which produces unnatural looking results.
uniform float EROSION_NORMALIZATION;

// Control over the erosion octaves, with each successive octave layering
// smaller gullies onto the terrain.
uniform int EROSION_OCTAVES;
// The lacunarity controls the frequency (the inverse
// horizontal scale) of each octave relative to the last.
uniform float EROSION_LACUNARITY;
// The gain controls the magnitude (the vertical
// scale) of each octave relative to the last.
uniform float EROSION_GAIN;


// ------------------------------------------------------------------------
// Terrain parameters not used in the erosion function itself.
// ------------------------------------------------------------------------

// Control over whether the erosion effect raises or lowers the terrain.
//  x: An offset value between -1 and 1, where a value of -1 only lowers, while
//     1 only raises. The offset is proportional to the erosion strength
//     parameter, so if that parameter is the same for the entire terrain, the
//     effect of the height offset will move the entire terrain surface up or
//     down by the same emount.
//  y: A value between 0 and 1 which is the degree to which the offset value is
//     replaced by the negated erosion fade target value. This has the effect
//     of only raising at valleys and only lowering at peaks, which, due to how
//     the erosion filter works, has the effect of largely preserving the minima
//     and maxima of the terrain.
uniform vec2 TERRAIN_HEIGHT_OFFSET;

// Base height noise parameters.

// The inverse horizontal scale of the terrain noise function.
uniform float HEIGHT_FREQUENCY;
// The vertical scale (amplitude) of the terrain noise function.
uniform float HEIGHT_AMP;
// Control over the noise function octaves, with each successive
// octave layering smaller bumps onto the terrain.
uniform int HEIGHT_OCTAVES;
// The lacunarity controls the frequency (the inverse
// horizontal scale) of each octave relative to the last.
uniform float HEIGHT_LACUNARITY;
// The gain controls the magnitude (the vertical scale)
// of each octave relative to the last.
uniform float HEIGHT_GAIN;

//custom 
uniform float SHOW_RED_CHANNEL;
uniform float SHOW_GREEN_CHANNEL;
uniform float SHOW_BLUE_CHANNEL;
uniform float SHOW_ALPHA_CHANNEL;
uniform float COMBINE_DATA_CHANNELS;

uniform float previewHeightScale;