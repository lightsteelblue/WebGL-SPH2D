#version 300 es

layout(std140) uniform CellTexture { vec4 cellTexelSizeOffset; };

uniform sampler2D cellTex;
out float vSum;

vec2 idx2uv(in float idx) {
    float y;
    float x = modf(idx * cellTexelSizeOffset.x + cellTexelSizeOffset.z, y);
    return vec2(x, y * cellTexelSizeOffset.y + cellTexelSizeOffset.w);
}

void main(void) {
    vec2 uv = idx2uv(float(gl_VertexID));
    gl_Position  = vec4(uv * 2.0 - 1.0, 0, 1);
    gl_PointSize = 1.0;

    // inclusive scan
    float sum = 0.0;
    for (float i = 0.0; i < uv.y; i += cellTexelSizeOffset.y)
        sum += texture(cellTex, vec2(uv.x, i + cellTexelSizeOffset.w)).x;

    vSum = sum * 255.0;
}
