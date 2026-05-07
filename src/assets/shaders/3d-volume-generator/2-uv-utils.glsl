//Generated from Unity Shadergraph
void twirlUv(vec2 uv, vec2 center, float strength, vec2 offset, out vec2 outUv)
{
    vec2 delta = uv - center;
    float angle = strength * length(delta);
    float x = cos(angle) * delta.x - sin(angle) * delta.y;
    float y = sin(angle) * delta.x + cos(angle) * delta.y;
    outUv = vec2(x + center.x + offset.x, y + center.y + offset.y);
}

//Generated from Unity Shadergraph
void spherizeUv(vec2 uv, vec2 center, vec2 strength, vec2 offset, out vec2 outUv)
{
    vec2 delta = uv - center;
    float delta2 = dot(delta.xy, delta.xy);
    float delta4 = delta2 * delta2;
    vec2 delta_offset = delta4 * strength;
    outUv = uv + delta * delta_offset + offset;
}

//Generated from Unity Shadergraph
void shearUv(vec2 uv, vec2 center, vec2 strength, vec2 offset, out vec2 outUv)
{
    vec2 delta = uv - center;
    float delta2 = dot(delta.xy, delta.xy);
    vec2 delta_offset = delta2 * strength;
    outUv = uv + vec2(delta.y, -delta.x) * delta_offset + offset;
}

void createPseudoVolumePosition(vec2 uv, out float mask, out vec3 position) {

    //Values need to increase from left to right and top to bottom since each tile will later be stacked in the 3D texture.
    //Therefore y component needs to be remapped.
    vec2 uvRemapped = vec2(uv.x, 1. - uv.y);
    uv = uvRemapped;


    vec2 cells = fract(uv * numCells);
    vec2 coords = uv * numCells;

    float frameIndex1D = coords.y * numCells + coords.x;
    float zFrameIndex = (frameIndex1D / (numCells * numCells) * tilingPerCell);

    vec2 uvPerCell = cells * tilingPerCell;
    vec3 noisePosition = vec3(uvPerCell.x, uvPerCell.y, zFrameIndex) + positionOffset;

    position = noisePosition;

    bool isFirstCell = coords.x <= 1. && coords.y <= 1.;
    bool isLastCell = coords.x >= numCells - 1. && coords.y >= numCells - 1.;

    //To create a padding for stacked noise slices since engines like Unity create weird artifacts on these. 
    if (hideFirstCell && isFirstCell)  {
        mask = 0.;
        return;
    }
    if (hideLastCell && isLastCell)  {
        mask = 0.;
        return;
    }

    //Another padding inside each cell. Also to avoid weird behaviour from Unity.
    float borderLeftTop = cells.x * cells.y;
    float borderRightBot = (1. - cells.x) * (1. - cells.y);
    float border = borderLeftTop * borderRightBot;
    float borderMask = smoothstep(border, 0.,  borderStrength * 0.01);

    float growFactorMult = 2.37;
    float growFactor = sin((zFrameIndex  - .5)) * centerRadius * 2.;
    growFactor = 1. - abs(growFactor); 
    growFactor *= growFactorMult;

    if (!growAndShrinkCells) growFactor = 0.;

    vec2 cellCenter = (cells - .5) * 2.;
    float centerMask = (1. - length(cellCenter) * centerRadius * 2.  + growFactor) / (1. - centerStrength * 2.);

    float completeMask = clamp(borderMask * centerMask, 0., 1.);
    mask = completeMask;

}


void modify_UV_for_NoiseSamplePosition(vec3 noisePosition, out vec3 noiseSamplePosition) {
    vec3 noiseSamplePos = noisePosition - 0.5;
 
    vec2 center = vec2(.5, .5);
    vec2 noiseUv = noisePosition.xy;
    vec2 noiseUvTwirled;
    twirlUv(noiseUv, center, cellTwirlStrength, vec2(0., 0.), noiseUvTwirled);

    vec2 noiseUvSpherized;
    spherizeUv(noiseUvTwirled, center, vec2(cellSpherizeStrength), vec2(0., 0.), noiseUvSpherized);

    vec2 noiseUvSheared;
    shearUv(noiseUvSpherized, center, vec2(cellRadialShearStrength), vec2(0., 0.), noiseUvSheared);

    noiseSamplePosition = vec3(
        noiseUvSheared.x,
        noiseUvSheared.y,
        noiseSamplePos.z + depth
    );

}