attribute float sculptAttribute;
varying vec2 vUv;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position * sculptAttribute, 1.0);
    vec3 adjustedPosition = position * sculptAttribute;
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(adjustedPosition, 1.0);
}