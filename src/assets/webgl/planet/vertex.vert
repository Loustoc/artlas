attribute float sculptAttribute;

void main() {
    vec3 adjustedPosition = position * sculptAttribute;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(adjustedPosition, 1.0);
}