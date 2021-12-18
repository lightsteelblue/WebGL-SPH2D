#version 300 es

precision highp isampler2D;

layout(std140) uniform ParticleTexture { vec4 particleTexelSizeOffset; };
layout(std140) uniform ToFloatPos { float toFloatPos; };

uniform vec4 moveScale;
uniform float particleRadius;
uniform isampler2D intPosTex;
uniform sampler2D velTex;

out vec4 vOut;

void main(void) {
    vec2[4] vertPos = vec2[](
        vec2(-1),
        vec2(1, -1),
        vec2(-1, 1),
        vec2(1)
    );

    float t   = float(gl_InstanceID) * particleTexelSizeOffset.x;
    vec2  uv  = vec2(fract(t), floor(t) * particleTexelSizeOffset.y) + particleTexelSizeOffset.zw;
    vec2  pos = vec2(texture(intPosTex, uv).xy) * toFloatPos; 
    pos += particleRadius * (vertPos[gl_VertexID & 3]);
    gl_Position = vec4(moveScale.zw * pos + moveScale.xy, 0, 1);

    float fac = (length(texture(velTex, uv).xy) - 2.0) / 5.0;
    vOut = vec4(vertPos[gl_VertexID & 3], clamp(fac, 0.0, 1.0), 0);
}
