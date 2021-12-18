#version 300 es

precision mediump float;

in float vDistance;
out vec4 oColor;

vec3 hsv2rgb(in vec3 hsv) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(hsv.xxx + K.xyz) * 6.0 - K.www);
    return hsv.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), hsv.y);
}

// ゴリ押しでそれっぽく
void main() {
    const vec3 L = normalize(vec3(0.4, 1, -0.2));
    const vec3 V = vec3(0, 0, -1);
    const vec3 H = normalize(L + V);
    
    float dDdx = dFdx(vDistance);
    float dDdy = dFdy(vDistance);
    vec3 N = vec3(normalize(vec2(dDdx, dDdy)), 0);

    float a = 0.4 * abs(dot(N, H)) + 0.6;
    float r = clamp((vDistance * a - 0.3) / (1.0 - 0.3), 0.0, 1.0);
    highp float c = step(0.5, r);
    highp float s = smoothstep(0.5*c, 0.5-0.5*c, r-0.5*c);

    N = normalize(vec3(N.xy, -0.5 * sqrt(1.0 - vDistance * vDistance)));

    highp float NdotH = max(dot(N, H), 0.0);
    float lambert = max(dot(-L, N), 0.0);
    float NdotH5 = NdotH * NdotH * NdotH * NdotH * NdotH;
    float specular = NdotH5 * step(0.1, vDistance);
    float q = 1.5 * dDdx * dDdx;
    q = 1.0 - min(q, 1.0);
    q *= abs(N.y);
    q = 0.4 * q + 0.6;
    float value = min(q * (0.3 * lambert + 0.9), 1.0);
    float satu = min(0.6 - 0.2 * smoothstep(1.0, 0.8, value) - 0.1 * (1.0 - specular), 1.0);
    oColor.rgb = hsv2rgb(vec3(0.57, satu, value)) + 0.6 * specular;
    oColor.a = s;
}
