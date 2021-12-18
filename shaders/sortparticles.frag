#version 300 es

precision highp float;

layout(std140) uniform ToIntPos { float toIntPos; };

uniform sampler2D posTex;
uniform sampler2D velTex;

in vec2 vOldUV;
layout(location = 0) out vec4 oPos;
layout(location = 1) out vec2 oVel;
layout(location = 2) out ivec2 oPosUInt;

void main(void) {
    oPos = texture(posTex, vOldUV);
    oVel = texture(velTex, vOldUV).xy;
    oPosUInt = ivec2(round(oPos.xy * toIntPos));
}
