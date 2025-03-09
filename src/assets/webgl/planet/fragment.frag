varying vec2 vUv;
varying float vSculptAttribute;

void main()
{
   float earthDepthLimit = 0.9;
float grassDepthLimit = 1.1;
float mountainHeightLimit = 1.3;
float snowHeightLimit = 1.5;

vec3 colorDarkestGreen = vec3(0.0, 0.3, 0.0);
vec3 colorDepthGround = vec3(110.0 / 255.0, 66.0 / 255.0, 27.0 / 255.0);
vec3 colorMountain = vec3(0.5, 0.5, 0.5);
vec3 colorSnow = vec3(1.0, 1.0, 1.0);

vec3 colorMix = vec3(1.0);

if (vSculptAttribute < earthDepthLimit) {
    float t = clamp((vSculptAttribute - (earthDepthLimit - 0.2)) * 5.0, 0.0, 1.0);
    colorMix = mix(colorDepthGround, colorDarkestGreen, t);
} else if (vSculptAttribute < grassDepthLimit) {
    float t = clamp((vSculptAttribute - earthDepthLimit) * 5.0, 0.0, 1.0);
    colorMix = mix(colorDarkestGreen, colorDarkestGreen, t);
} else if (vSculptAttribute < mountainHeightLimit) {
    float t = clamp((vSculptAttribute - grassDepthLimit) * 5.0, 0.0, 1.0);
    colorMix = mix(colorDarkestGreen, colorMountain, t);
} else if (vSculptAttribute < snowHeightLimit) {
    float t = clamp((vSculptAttribute - mountainHeightLimit) * 5.0, 0.0, 1.0);
    colorMix = mix(colorMountain, colorSnow, t);
} else {
    colorMix = colorSnow;
}
gl_FragColor = vec4(colorMix, 1.0);

    
}