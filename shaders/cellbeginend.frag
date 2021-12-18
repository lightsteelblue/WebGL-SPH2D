#version 300 es

precision highp float;

layout(std140) uniform CellTexture { vec4 cellTexelSizeOffset; };
layout(std140) uniform Cell {
    vec2 cellResolution;
    vec2 cellOrigin;
    float rcplCellSize;
};

uniform sampler2D xscanTex;
uniform sampler2D cellTex; 

flat in float vSum;

layout(location = 0) out float oExclusiveSum;
layout(location = 1) out uvec2 oBeginEnd;

vec2 idx2uvT(in float idx) {
    float y;
    float x = modf(idx * cellTexelSizeOffset.x + cellTexelSizeOffset.z, y);
    return vec2(y * cellTexelSizeOffset.y + cellTexelSizeOffset.w, x);
}

void main(void){
    float idx = floor(gl_FragCoord.y) * cellResolution.x + floor(gl_FragCoord.x);
    vec2  uv  = idx2uvT(idx);

    float inclSum = vSum + texture(xscanTex, uv).x;
    float exclSum = inclSum - floor(texture(cellTex, uv).x * 255.0);
    oExclusiveSum = exclSum;

    uv = idx2uvT(idx - 1.0);
    float begin = exclSum - floor(texture(cellTex, uv).x * 255.0) * step(0.0, uv.x);

    uv = idx2uvT(idx + 1.0);
    float end = inclSum + floor(texture(cellTex, uv).x * 255.0) * step(uv.x, 1.0);

    oBeginEnd = uvec2(begin, end);
}
