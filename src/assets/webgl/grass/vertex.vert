attribute float sculptAttribute;
varying vec2 vUv;

vec3 localToWorld(vec3 target) {
      return (modelMatrix * instanceMatrix * vec4(target, 1.0)).xyz;
}

void main() {
    vec3 worldPosition = localToWorld(position) * sculptAttribute;
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(worldPosition, 1.0);
}
