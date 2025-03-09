varying vec2 vUv;

void main() {
    vec3 colorBrightest = vec3(0.,1.,0.);
    vec3 colorDarkest = vec3(0.,.3,0.);
    vec3 color = mix(
    colorDarkest,
    colorBrightest,
    (1.-vUv.x) / 2.0
    );

    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.);
}