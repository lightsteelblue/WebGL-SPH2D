#version 300 es

precision highp isampler2D;

layout(std140) uniform ParticleTexture { vec4  particleTexelSizeOffset; };
layout(std140) uniform ToFloatPos      { float toFloatPos; };
layout(std140) uniform Cell {
    vec2 cellResolution;
    vec2 cellOrigin;
    float rcplCellSize;
};
layout(std140) uniform Subcell {
    vec2 subcellResolution;
    vec2 sebcellOrigin;
    vec2 rcplSubcellSize;
};

uniform float particleCount;
uniform sampler2D scanTex;
uniform isampler2D subcellTex;
uniform sampler2D indexTex;
uniform isampler2D intPosTex;

out vec2 vOldUV;

float orderInsideCell(in float idx, in ivec2 cell, in ivec2 subcell) {
    ivec2 local = subcell - cell * ivec2(4, 2);
    int localIdx = 4 * local.y + local.x;
    int sc = texelFetch(subcellTex, cell.yx, 0).x;
    int sum = 0;
    for (int i = 0; i < localIdx; i++)
        sum += (sc >> 2 * i) & 3;

    if (idx + 1.0 == texelFetch(indexTex, subcell, 0).x)
        return float(sum);
    if (idx + 1.0 == texelFetch(indexTex, subcell + ivec2(0, subcellResolution.y), 0).x)
        return float(sum) + 1.0;
    return -1.0;
}

vec2 idx2uv(in float idx) {
    float y;
    float x = modf(idx * particleTexelSizeOffset.x + particleTexelSizeOffset.z, y);
    return vec2(x, y * particleTexelSizeOffset.y + particleTexelSizeOffset.w);
}

void main(void) {
    float idx = float(gl_VertexID);
    vOldUV = idx2uv(idx);
    vec2  pos = vec2(texture(intPosTex, vOldUV).xy) * toFloatPos;
    ivec2 cell = ivec2(floor((pos - cellOrigin) * rcplCellSize));
    ivec2 subcell = ivec2(floor((pos - sebcellOrigin) * rcplSubcellSize));

    float order = orderInsideCell(idx, cell, subcell);
    // 1回だけならサブセルに3粒子存在しても対応できる
    float newIdx = order < 0.0 ? particleCount - 1.0 : floor(texelFetch(scanTex, cell, 0).x) + order;
    vec2  newUV  = idx2uv(newIdx);
    gl_Position  = vec4(newUV * 2.0 - 1.0, 0, 1);
    gl_PointSize = 1.0;
}
