#version 300 es

layout(std140) uniform SPHVertexShader {
    vec2 quadMin;
    vec2 quadMax;
};

void main(void) {
    vec2[4] vpos = vec2[](
        quadMin,
        vec2(quadMax.x, quadMin.y),
        vec2(quadMin.x, quadMax.y),
        quadMax
    );

    gl_Position = vec4(vpos[gl_VertexID & 3] * 2.0 - 1.0, 0, 1);
}
