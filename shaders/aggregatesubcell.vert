#version 300 es

layout(std140) uniform CellTexture { vec4 cellTexelSizeOffset; };
layout(std140) uniform SubcellTexture { vec4 subcellTexelSizeOffset; };

uniform sampler2D indexTex;

flat out int vSubcell;

float countUpSubcell(in vec2 uv_00, in vec2 shift) {
    vec2 uv_s = uv_00 + shift * subcellTexelSizeOffset.xy;
    float i1 = texture(indexTex, uv_s).x;
    if (i1 == 0.0)
        return 0.0;
    float i2 = texture(indexTex, uv_s + vec2(0, 0.5)).x;
    return i1 == i2 ? 1.0 : 2.0;
}

vec2 idx2uv(in float idx) {
    float y;
    float x = modf(idx * cellTexelSizeOffset.x + cellTexelSizeOffset.z, y);
    return vec2(x, y * cellTexelSizeOffset.y + cellTexelSizeOffset.w);
}

void main(void) {
    vec2 uv = idx2uv(float(gl_VertexID));
    gl_Position = vec4(uv.yx * 2.0 - 1.0, 0, 1);
    gl_PointSize = 1.0;

    vec2 uv_00 = uv - cellTexelSizeOffset.zw;
    uv_00 = vec2(1, 0.5) * uv_00 + subcellTexelSizeOffset.zw;

    // |4|5|6|7|
    // |0|1|2|3|
    float sum = countUpSubcell(uv_00, vec2(0));
    sum += countUpSubcell(uv_00, vec2(1, 0)) * 4.0;
    sum += countUpSubcell(uv_00, vec2(2, 0)) * 16.0;
    sum += countUpSubcell(uv_00, vec2(3, 0)) * 64.0;
    sum += countUpSubcell(uv_00, vec2(0, 1)) * 256.0;
    sum += countUpSubcell(uv_00, vec2(1, 1)) * 1024.0;
    sum += countUpSubcell(uv_00, vec2(2, 1)) * 4096.0;
    sum += countUpSubcell(uv_00, vec2(3, 1)) * 16384.0; // <<14
    vSubcell = int(sum);
}
