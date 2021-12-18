#version 300 es

precision highp float;
precision highp isampler2D;
precision highp usampler2D;

layout(std140) uniform ParticleTexture { vec4  particleTexelSizeOffset; };
layout(std140) uniform CellTexture     { vec4  cellTexelSizeOffset; };
layout(std140) uniform ToFloatPos      { float toFloatPos; };
layout(std140) uniform ToIntPos        { float toIntPos; };
layout(std140) uniform Cell {
    vec2 cellResolution;
    vec2 cellOrigin;
    float rcplCellSize;
};
layout(std140) uniform Update {
    vec2  particleTexMaxUV;
    float dp;
    float rho0;
    float rcplRho0;
    float kernelRadius;
    float kernelRadiusSq;
    float rcplKernelRadius;
    float coefViscosity;
    float coefSurfTension;
    float coefAcceleration;
    float coefRepul;
    float domainRadius;
    float dt;
    float velLimit;
};

uniform vec2  g;
uniform vec4  pointerPosVel;
uniform float pointerRadius;
uniform sampler2D  posTex;
uniform isampler2D intPosTex;
uniform sampler2D  velTex;
uniform usampler2D cellBeginEndTex;
uniform sampler2D  accWallKerTex;


layout(location = 0) out vec4 oPos;
layout(location = 1) out vec2 oVel;
layout(location = 2) out ivec2 oIntPos;

vec2 idx2uv(in float idx, in vec4 texelSizeOffset) {
    float y;
    float x = modf(idx * texelSizeOffset.x + texelSizeOffset.z, y);
    return vec2(x, y * texelSizeOffset.y + texelSizeOffset.w);
}

vec2 cell2uv(in vec2 cell) {
    return idx2uv(cell.y * cellResolution.x + cell.x, cellTexelSizeOffset);
}

vec2 calcAcceleration() {
    vec2 pos_i;
    vec2 vel_i;
    vec2 pr_i;
    {
        vec2 uv_i  = gl_FragCoord.xy * particleTexelSizeOffset.xy;
        vec4 vpr_i = texture(velTex, uv_i);
        pos_i = vec2(texture(intPosTex, uv_i).xy) * toFloatPos;
        vel_i = vpr_i.xy;
        pr_i  = vpr_i.zw;
        if (uv_i.x > particleTexMaxUV.x && uv_i.y > particleTexMaxUV.y) {
            pos_i = vec2(domainRadius);
            vel_i = vec2(0, 0);
            pr_i  = vec2(0, rcplRho0);
        }
    }
    vec2 cell_i = floor((pos_i - cellOrigin) * rcplCellSize);
    vec2 acc_i  = vec2(0);

    for (float cy = -1.; cy <= 1.; cy++) {
        vec2 uv_c   = cell2uv(vec2(cell_i.x, cell_i.y + cy));
        vec2 begEnd = vec2(texture(cellBeginEndTex, uv_c).xy);

        for (float j = begEnd.x; j < begEnd.y; j++) {
            vec2  uv_j   = idx2uv(j, particleTexelSizeOffset);
            vec2  pos_ij = pos_i - vec2(texture(intPosTex, uv_j).xy) * toFloatPos;
            float r_sq   = dot(pos_ij, pos_ij);
            if (r_sq > kernelRadiusSq) continue;

            vec4 vpr_j = texture(velTex, uv_j);

            float rr  = inversesqrt(r_sq + 1e-8);
            float r   = r_sq * rr;

            // 表面張力
            float st = kernelRadiusSq - r_sq;
            st = st * st * st * coefSurfTension * step(0.9 * dp, r);
            acc_i -= st * pos_ij;

            vec2 vel_ij = vel_i - vpr_j.xy;
            vec2 prr_ij = vec2(pr_i.x + vpr_j.z, pr_i.y * vpr_j.w);

            float ker = 1.0 - r * rcplKernelRadius;
            ker = ker * ker * ker;

            // 粘性項
            acc_i += (coefViscosity * prr_ij.y * ker) * vel_ij;

            // 圧力項と人工斥力
            float pres_ij  = -prr_ij.x * prr_ij.y;
            float repul_ij = coefRepul * rr * max(0.98 * dp - r, 0.0);
            acc_i += (pres_ij * ker + repul_ij) * pos_ij;
        }
    }

    float dist_iw = domainRadius - length(pos_i) + 0.5 * dp;
    if (dist_iw < kernelRadius) {
        vec2  accWKer = texture(accWallKerTex, vec2(dist_iw * rcplKernelRadius, 0.5)).xy;
        vec2  posDir  = normalize(pos_i);
        float pres    = max((pr_i.x + rho0 * dot(g, dist_iw * posDir)) * pr_i.y * rcplRho0, 0.0);
        float repul   = 10.0 * coefRepul * clamp(dp - dist_iw, 0.0, 0.5 * dp);
        acc_i += (pres * accWKer.x - repul) * posDir + 0.2 * coefViscosity * vel_i * pr_i.y * rcplRho0 * accWKer.y;
    }

    acc_i *= coefAcceleration;
    acc_i += g;

    return acc_i;
}

void main(void) {
    vec2 acc  = calcAcceleration();
    vec4 pvh  = texture(posTex, gl_FragCoord.xy * particleTexelSizeOffset.xy);
    vec2 pos  = pvh.xy;
    vec2 velh = pvh.zw;

    float dist_im_sq = dot(pos - pointerPosVel.xy, pos - pointerPosVel.xy);
    if (dist_im_sq < pointerRadius * pointerRadius) {
        float scale = 1.0 - dist_im_sq / (pointerRadius * pointerRadius);
        vec2 temp = velh + pointerPosVel.zw * scale * scale * scale;
        if (dot(temp, temp) < 0.25 * velLimit * velLimit)
            velh = temp;
    }

    // leap-frog
    vec2 vel;
    velh += dt * acc;
    vel   = velh + 0.5 * dt * acc;
    if (dot(velh, velh) > velLimit * velLimit)
        velh = velLimit * normalize(velh);
    if (dot(vel, vel) > velLimit * velLimit)
        vel  = velLimit * normalize(vel);
    pos += dt * velh;

    oPos    = vec4(pos, velh);
    oVel    = vel;
    oIntPos = ivec2(round(pos * toIntPos));
}
