#version 300 es

precision mediump float;

uniform vec2 rcplResolution;
out vec4 color;

void main() {
    vec2 p = gl_FragCoord.xy * rcplResolution;
    float k = cos(0.4 * (p.x - 0.5)) * cos((p.y < 0.5 ? 0.8 : 0.6) * (p.y - 0.5));
    vec3 c = vec3(k, 0.6 * k + 0.4, 0.5 * k + 0.5);
    vec3 rgb = c * vec3(0.96, 1, 1.02);
    color = vec4(rgb, 1);
}