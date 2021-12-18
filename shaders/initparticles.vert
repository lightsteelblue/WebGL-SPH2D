#version 300 es

layout(std140) uniform ParticleTexture { vec4 particleTexelSizeOffset; };

layout(location = 0) in vec2 pos;
layout(location = 1) in vec2 vel;
layout(location = 2) in vec2 velh;
out vec2 vPos;
out vec2 vVel;
out vec2 vVelh;

vec2 uv() {
    float y;
    float x = modf(float(gl_VertexID) * particleTexelSizeOffset.x + particleTexelSizeOffset.z, y);
    return vec2(x, y * particleTexelSizeOffset.y + particleTexelSizeOffset.w);
}

void main(void) {
    vPos  = pos;
    vVel  = vel;
    vVelh = velh;
    gl_Position = vec4(uv() * 2.0 - 1.0, 0, 1);
    gl_PointSize = 1.0;
}
