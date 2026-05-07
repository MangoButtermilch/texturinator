float nebulaNoise(vec3 p) {

    float perlinBig = cnoise(p * 2.);
    float perlinSmall = cnoise(p);

    return 1. - abs(perlinBig - perlinSmall);
}