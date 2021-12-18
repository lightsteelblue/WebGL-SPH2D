#version 300 es

precision highp float;

layout(std140) uniform ToIntPos { float toIntPos; };

in vec2 vPos;
in vec2 vVel;
in vec2 vVelh;
layout(location = 0) out vec4 oPos;
layout(location = 1) out vec2 oVel;
layout(location = 2) out ivec2 oIntPos;

void main(void){
    oPos = vec4(vPos, vVelh);
    oVel = vVel;
    oIntPos = ivec2(round(vPos * toIntPos));
}
