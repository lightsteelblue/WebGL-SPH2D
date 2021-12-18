#version 300 es

uniform float texelSize;
layout(location = 0) in vec3 val;
out vec3 v;

void main(void) {
    v = val;
    float u = float(gl_VertexID) * texelSize * 2.0 - 1.0;
    gl_Position = vec4(u + texelSize * 0.5, 0, 0, 1);
    gl_PointSize = 1.0;
}
