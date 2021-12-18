#version 300 es

layout(std140) uniform MarchingSquares {
   vec2  msResolution;
   vec2  msRcplResolution;
   vec2  msCellOrigin;
   float msCellSize;
};

uniform vec4 moveScale;
uniform sampler2D distFieldTex;

layout(location = 0) in float vertIndices;

out mediump float vDistance;

#define EPS 1e-8

//
// [>, ^]は辺ベクトルの意味
//      7>
//  2-------3
// ^|       |^
// 5|       |6
//  |       |
//  0-------1
//      4>
//
// xy: 基準位置
// zw: 補間位置計算用の辺ベクトル
const vec4[8] vertEdge = vec4[](
    vec4(0),          //0
    vec4(1, 0, 0, 0), //1
    vec4(0, 1, 0, 0), //2
    vec4(1, 1, 0, 0), //3
    vec4(0, 0, 1, 0), //4
    vec4(0, 0, 0, 1), //5
    vec4(1, 0, 0, 1), //6
    vec4(0, 1, 1, 0)  //7
);

const int[96] table = int[](
    //  いる頂点       いらない頂点
                      0, 0, 0, 0, 0, 0,
    0, 4, 5,          5, 5, 5,
    1, 4, 6,          6, 6, 6,
    0, 1, 5, 6,       6, 6,
    2, 5, 7,          7, 7, 7,
    0, 4, 2,          7, 7, 7,
    5, 4, 2, 1, 7, 6,
    0, 2, 7, 0, 6, 1,
    3, 7, 6,          6, 6, 6,
    4, 6, 0, 3, 5, 7,
    4, 1, 7, 3,       3, 3,
    0, 1, 5, 7, 1, 3,   
    5, 6, 2, 3,       3, 3,
    0, 4, 2, 6, 2, 3,
    1, 4, 3, 5, 3, 2,
    0, 1, 2, 3,       3, 3
);

void main() {
    vec2 cell;
    cell.y = floor(float(gl_InstanceID) * msRcplResolution.x);
    cell.x = float(gl_InstanceID) - cell.y * msResolution.x;

    // z - w
    // |   |
    // x - y
    vec2 c1 = min(cell + 1.0, msResolution - 1.0);
    mediump vec4 dist = vec4(
        texelFetch(distFieldTex, ivec2(cell), 0).x,
        texelFetch(distFieldTex, ivec2(c1.x, cell.y), 0).x,
        texelFetch(distFieldTex, ivec2(cell.x, c1.y), 0).x,
        texelFetch(distFieldTex, ivec2(c1), 0).x
    );

    //  |-w-|
    //  y   z
    //  |-x-|
    mediump vec4 onSurface = vec4(
        dist.x / (dist.x - dist.y + EPS),
        dist.x / (dist.x - dist.z + EPS),
        dist.y / (dist.y - dist.w + EPS),
        dist.z / (dist.z - dist.w + EPS)
    );

    float pattern = dot(step(dist, vec4(0)), vec4(1, 2, 4, 8));
    int   info    = table[int(pattern * 6.0 + vertIndices)];
    vec2  vert    = cell + vertEdge[info].xy + vertEdge[info].zw * onSurface[info & 3];
    vec2  vertPos = vert * msCellSize + msCellOrigin;
    gl_Position = vec4(moveScale.zw * vertPos + moveScale.xy, 0, 1);

    mediump float d = dist[info & 3] * step(float(info), 3.0);
    vDistance = clamp(1.0 - abs(d), 0.0, 1.0);
}
