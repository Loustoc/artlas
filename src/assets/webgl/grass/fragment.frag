varying vec2 vUv;

void main() {
    vec3 colorBrightest = vec3(0.,.8,0.);
    vec3 colorDarkest = vec3(0.,.1,0.);
    vec3 color = mix(
    colorBrightest,
    colorDarkest,
    distance(vec2(0.3), vUv)
    );
    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.);
}