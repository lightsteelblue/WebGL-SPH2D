#version 300 es

precision highp float;

layout(std140) uniform ToIntPos { float toIntPos; };

in vec2 vPos;
out ivec2 oPos;

void main(void) {
    oPos = ivec2(round(vPos * toIntPos));
}
