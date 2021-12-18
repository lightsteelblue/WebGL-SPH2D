#version 300 es
precision highp float;

in vec3 v;
layout(location = 0) out float oDens;
layout(location = 1) out vec2 oAcc;

void main(void){
    oDens = v.x;
    oAcc = v.yz;
}
