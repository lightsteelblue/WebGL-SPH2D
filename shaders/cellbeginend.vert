#version 300 es

layout(std140) uniform CellTexture_ { vec4 cellTexelSizeOffset_; };
uniform sampler2D xscanTex_;

flat out float vSum;

void main(void) {
    float lineY = float(gl_VertexID & 1);
    float lineX = (float(gl_InstanceID) + lineY) * cellTexelSizeOffset_.x;
    gl_Position = vec4(2.0 * vec2(lineY, lineX) - 1.0, 0, 1);

    float u_last = float(gl_InstanceID - 1) * cellTexelSizeOffset_.x + cellTexelSizeOffset_.z;
    float v_scan = 1.0 - cellTexelSizeOffset_.y + cellTexelSizeOffset_.w;

    // キャッシュに乗せとく
    vSum = texture(xscanTex_, vec2(u_last, v_scan)).x;
    if (gl_InstanceID == 0) 
        vSum = 0.0;

    // exclusive scan
    u_last -= cellTexelSizeOffset_.x;
    for (float i = 0.0; i < u_last; i += cellTexelSizeOffset_.x)
        vSum += texture(xscanTex_, vec2(i + cellTexelSizeOffset_.z, v_scan)).x;
}
