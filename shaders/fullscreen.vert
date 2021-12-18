#version 300 es
void main() {
    gl_Position = vec4(vec2(gl_VertexID & 1, gl_VertexID >> 1) * 4.0 - 1.0, 0, 1);
    //gl_Position = vec4(vec2(gl_VertexID&1, gl_VertexID>>1)*2.0 - 1.0, 0, 1);
}
