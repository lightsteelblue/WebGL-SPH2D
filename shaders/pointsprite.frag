#version 300 es

precision mediump float;

in vec4 vOut;
out vec4 oColor;

void main(void){
    vec3 N;
    N.xy = vOut.xy;
    float r_sq = dot(N.xy, N.xy);
    if (r_sq > 1.0) discard;
    N.z = -sqrt(1.0 - r_sq);

    vec3 c1 = vec3(0.1, 0.7, 1);
    vec3 c2 = vec3(0.9, 0.95, 1);

    vec3 L = normalize(vec3(0, 1, -0.2));
    vec3 V = vec3(0, 0, -1);
    vec3 H = normalize(L + V);
    float lambert  = 0.5 * max(dot(L, N), 0.0) + 0.5;
    float specular = 0.1 * pow(max(dot(N, H), 0.0), 5.0);

    vec3 cdif = mix(c1, c2, vOut.z) * lambert;
    vec3 cspc = vec3(specular);
    oColor = vec4(cdif + cspc + 0.1, 1);
}
