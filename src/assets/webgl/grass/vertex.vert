attribute float sculptAttribute;
varying vec2 vUv;
uniform float time;
uniform float grassScale;

vec3 localToWorld(vec3 target) {
      return (modelMatrix * instanceMatrix * vec4(target, 1.0)).xyz;
}

float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float createNoise(vec2 n) {
    vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));

    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

void main() {
    vec3 worldPosition = localToWorld(position) * sculptAttribute;
    float topGrassLimit = 1.2;
    float bottomGrassLimit = 0.9;
    float bottomClampedSculpt = sculptAttribute - bottomGrassLimit;
    float diffTop = clamp((sculptAttribute - topGrassLimit), 0.0, 1.);
    float scale = mix(1., 0., clamp(bottomClampedSculpt / -0.2, 0., 1.)) * mix(1., .0, diffTop);
    worldPosition *= scale;
    float noise = createNoise(vec2(worldPosition.x, worldPosition.z)) * 0.6 + 0.4;
    vec3 sway = 0.04 * vec3(
        cos(time) * noise,
        0.0,
        0.0
    );
    worldPosition += sway;
    worldPosition *= clamp(grassScale / 0.05, 0., 1.5);
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(worldPosition, 1.0);
}
