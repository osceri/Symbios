#version 330 core

uniform vec2 resolution;
uniform float time;
uniform sampler2D source;
uniform sampler2D image;
in vec2 uv;
out vec4 color;

const int OCTAVES = 6;
const float PERSISTENCE = 0.5;
const float LACUNARITY = 2.0;

vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float maxValue = 0.0;
    
    for (int i = 0; i < OCTAVES; i++) {
        total += noise(p * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= PERSISTENCE;
        frequency *= LACUNARITY;
    }
    
    return total / maxValue;
}

vec4 ocean(vec2 x) {
    // Time-varying FBM
    float f = 0.0;
    float a = 0.8;
    float da = 0.5;

    vec2 st = uv - 0.005 * time;
    for (int i = 0; i < 3; i++) {
        st = 1.7 * st;
        f += 0.7 * fbm(st + f / a);
        a *= da;
    }
    
    vec3 col = mix(vec3(0.0, 0.3, 0.5), vec3(0.0, 0.7, 0.9), f);
    col = mix(col, pow(col, vec3(0.1545)), 0.1);


    return vec4(col, 1.0);
}


float waves(vec2 x) {
    // Time-varying FBM
    float f = 0.0;
    float a = 0.8;
    float da = 0.5;

    vec2 st = uv;
    for (int i = 0; i < 3; i++) {
        st = 3.7 * st + 0.1 * pow(a, -3.);
        f += 1.0 * fbm(st + f / a - 0.05 * time);
        a *= da;
    }
    
    return pow(clamp(f, 0.05, 0.40), 2.);
}

vec2 rotate(vec2 v, float a) {
    return vec2(cos(a) * v.x - sin(a) * v.y, sin(a) * v.x + cos(a) * v.y);
}

float cloud(vec2 x) {
    // Time-varying FBM
    float f = 0.0;
    float a = 0.8;
    float da = 0.8;

    float s = 1.8 + 0.6 * sin(time / 80.);
    float df = -0.05 + 0.1 * sin(time / 160.);

    vec2 st = uv * 5.;
    for (int i = 0; i < 2; i++) {
        st = st + vec2(time) * 0.005 * pow(a, -4.);
        f += s * fbm(st + f) + df;
        a *= da;
    }
    
    return f;
}

void main() {
    vec4 col = ocean(uv);
    col = mix(col, vec4(0.0, 0.0, 0.0, 1.0), waves(uv));
    col = mix(col, vec4(0.4, 0.4, 0.6, 1.0), pow(clamp(cloud(uv) - 0.15, 0., 1.), .2));
    col = mix(col, vec4(1.0, 1.0, 1.0, 1.0), pow(clamp(cloud(uv) - 0.25, 0., 1.), .4));

    color = col;
}