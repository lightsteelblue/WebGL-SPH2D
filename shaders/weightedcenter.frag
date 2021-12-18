#version 300 es

precision highp float;
precision highp isampler2D;
precision highp usampler2D;

layout(std140) uniform ParticleTexture { vec4  particleTexelSizeOffset; };
layout(std140) uniform CellTexture     { vec4  cellTexelSizeOffset; };
layout(std140) uniform ToFloatPos      { float toFloatPos; };
layout(std140) uniform Cell {
    vec2 cellResolution;
    vec2 cellOrigin;
    float rcplCellSize;
};
layout(std140) uniform MarchingSquares {
   vec2  msResolution;
   vec2  msRcplResolution;
   vec2  msCellOrigin;
   float msCellSize;
};
uniform float smoothRadius;
uniform isampler2D intPosTex;
uniform usampler2D cellBeginEndTex;

out vec4 o;

vec2 idx2uv(in float idx, in vec4 texelSizeOffset) {
    float y;
    float x = modf(idx * texelSizeOffset.x + texelSizeOffset.z, y);
    return vec2(x, y * texelSizeOffset.y + texelSizeOffset.w);
}

vec2 cell2uv(in vec2 cell) {
    return idx2uv(cell.y * cellResolution.x + cell.x, cellTexelSizeOffset);
}

void main(void) {
    vec2  pos_i  = floor(gl_FragCoord.xy) * msCellSize + msCellOrigin;
    vec2  cell_i = floor((pos_i - cellOrigin) * rcplCellSize);
    vec4  wx_i   = vec4(0);
    float R_sq   = smoothRadius * smoothRadius;

    for (float cy = -2.; cy <= 2.; cy++) {
        vec2 uv_cb = cell2uv(vec2(cell_i.x - 1.0, cell_i.y + cy));
        vec2 uv_ce = cell2uv(vec2(cell_i.x + 1.0, cell_i.y + cy));
        float begin = vec2(texture(cellBeginEndTex, uv_cb).xy).x;
        float end   = vec2(texture(cellBeginEndTex, uv_ce).xy).y;

        for (float j = begin; j < end; j++) {
            vec2  uv_j   = idx2uv(j, particleTexelSizeOffset);
            vec2  pos_ij = pos_i - vec2(texture(intPosTex, uv_j).xy) * toFloatPos;
            float r_sq   = dot(pos_ij, pos_ij);
            float neigh  = step(r_sq, R_sq);
            float w = (R_sq - r_sq) * neigh;
            w = w * w * w;
            wx_i += vec4(w, w, w, neigh) * vec4(pos_ij, 1, 1);
        }
    }

    o = vec4((wx_i.w > 0.0 ? (pos_i - wx_i.xy/wx_i.z) : pos_i), wx_i.w, 0);
}
