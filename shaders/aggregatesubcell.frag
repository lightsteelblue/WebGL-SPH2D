#version 300 es

precision mediump float;

flat in int vSubcell;
layout(location = 0) out float oCount;
layout(location = 1) out int oSubcell;

void main(void) {
    oSubcell = vSubcell;

    int sum = 0;
    for (int i = 0; i < 8; i++)
        sum += (vSubcell >> 2 * i) & 3;
    oCount = float(sum) / 255.0;
}
