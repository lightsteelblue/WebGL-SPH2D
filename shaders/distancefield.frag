#version 300 es

precision highp float;

layout(std140) uniform MarchingSquares {
   vec2  msResolution;
   vec2  msRcplResolution;
   vec2  msCellOrigin;
   float msCellSize;
};

uniform float particleRadius;
uniform sampler2D weightedCenterTex;

out mediump float oDistance;

void main(void) {
    ivec2 node = ivec2(floor(gl_FragCoord));
    //      3
    //      |
    // 0----@----1
    //      |
    //      2
    ivec2 lim = ivec2(msResolution - 1.0);
    vec2[4] r = vec2[](
        texelFetch(weightedCenterTex, max(node - ivec2(1, 0), ivec2(0)), 0).xy,
        texelFetch(weightedCenterTex, min(node + ivec2(1, 0), lim),      0).xy,
        texelFetch(weightedCenterTex, max(node - ivec2(0, 1), ivec2(0)), 0).xy,
        texelFetch(weightedCenterTex, min(node + ivec2(0, 1), lim),      0).xy
    );

    // ∇ × r
    vec4 m = vec4(
        r[1].x - r[0].x, r[1].y - r[0].y,
        r[3].x - r[2].x, r[3].y - r[2].y
    ) * 1.0 / (2.0 * msCellSize);

    float B = m.x + m.w;
    float C = m.x * m.w - m.y * m.z;
    float root = sqrt(max(B*B - 4.*C, 0.0));
    float EV1 = 0.5 * abs(B + root);
    float EV2 = 0.5 * abs(B - root);
    float EVMax = max(EV1, EV2);

    // Solenthaler(2007)
    const float t_high = 2.0;
    const float t_low = 1.0;
    float f = 1.0;
    if (EVMax > t_low) {
        float g = max(t_high - EVMax, 0.0) / (t_high - t_low);
        f = g * (g*g - 3.0*g + 3.0);
    }

    vec3 wr_i = texelFetch(weightedCenterTex, node, 0).xyz;
    if (wr_i.z == 0.0) {
        oDistance = 1000.0;
    } else if (wr_i.z >= 15.0) {
        oDistance = -1.0;
    } else {
        vec2 pos = vec2(node) * msCellSize + msCellOrigin;
        oDistance = length(pos - wr_i.xy) - f * particleRadius;
        oDistance /= particleRadius;
    }
}
