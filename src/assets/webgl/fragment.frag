#define PI 3.1415926535897932384626433832795

varying vec2 vUv;

uniform vec2 drawnUV;

void main()
{
    gl_FragColor = vec4(vUv, 1.0, 1.0);
}