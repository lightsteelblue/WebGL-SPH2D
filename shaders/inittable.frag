#version 300 es

precision mediump float;

in float v;
out int o;

void main(void){
    o = int(v);
}
