attribute float sculptAttribute;
varying vec2 vUv;
varying float vSculptAttribute;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position * sculptAttribute, 1.0);
    vSculptAttribute = sculptAttribute;
    vec3 adjustedPosition = position * sculptAttribute;
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(adjustedPosition, 1.0);
}