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
layout(std140) uniform Density {
    vec2  particleTexMaxUV;
    float dp;
    float rcplRho0;
    float kernelRadius;
    float kernelRadiusSq;
    float rcplKernelRadius;
    float coefDensity;
    float pressB;
    float domainRadius;
};

uniform isampler2D intPosTex;
uniform sampler2D  velTex;
uniform usampler2D cellBeginEndTex;
uniform sampler2D  densWallKerTex;

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
    vec2 uv_i  = gl_FragCoord.xy * particleTexelSizeOffset.xy;
    vec2 pos_i = vec2(texture(intPosTex, uv_i).xy) * toFloatPos;
    if (uv_i.x > particleTexMaxUV.x && uv_i.y > particleTexMaxUV.y)
        pos_i = vec2(domainRadius);
    vec2 cell_i = floor((pos_i - cellOrigin) * rcplCellSize);
    float rho_i = 0.0;

    for (float cy = -1.; cy <= 1.; cy++) {
        vec2 uv_c   = cell2uv(vec2(cell_i.x, cell_i.y + cy));
        vec2 begEnd = vec2(texture(cellBeginEndTex, uv_c).xy);

        for (float j = begEnd.x; j < begEnd.y; j++) {
            vec2  uv_j   = idx2uv(j, particleTexelSizeOffset);
            vec2  pos_ij = pos_i - vec2(texture(intPosTex, uv_j).xy) * toFloatPos;
            float poly6  = kernelRadiusSq - dot(pos_ij, pos_ij);
            rho_i += poly6 * poly6 * poly6 * step(0.0, poly6);
        }
    }

    float u_w = (domainRadius - length(pos_i) + 0.5 * dp) * rcplKernelRadius;
    if (u_w < 1.0)
        rho_i += texture(densWallKerTex, vec2(u_w, 0.5)).x;

    rho_i *= coefDensity;
    float relrho_i = rho_i * rcplRho0;
    float pres_i = max(pressB * (relrho_i * relrho_i - 1.0), 0.0);

    o = vec4(texture(velTex, uv_i).xy, pres_i, 1./rho_i);
}
