uniform float totalBrightness;
uniform float depth;
uniform float numCells;
uniform float tilingPerCell;
uniform vec3 positionOffset;

uniform bool growAndShrinkCells;
uniform float borderStrength;
uniform float centerStrength;
uniform float centerRadius;

uniform bool hideFirstCell;
uniform bool hideLastCell;

uniform float cellTwirlStrength;
uniform float cellSpherizeStrength;
uniform float cellRadialShearStrength;

uniform vec4 noiseLayer1;
uniform vec4 noiseLayer2;
uniform vec4 noiseLayer3;
uniform vec4 noiseLayer4;
uniform vec4 noiseLayerDistortion;//x = layer 1, y = layer 2 etc.
uniform vec4 noiseLayerEnabled;//x = layer 1, y = layer 2 etc.
uniform vec4 noiseLayerInverted;//x = layer 1, y = layer 2 etc.
