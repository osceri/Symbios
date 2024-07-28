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

vec2 rotate(vec2 v, float a) {
    mat2 m = mat2(cos(a), -sin(a), sin(a), cos(a));
    return m * v;
}

float cloud(vec2 x) {
    // Time-varying FBM
    float f = 0.0;
    float a = 0.8;
    vec2 st = uv;
    for (int i = 0; i < 3; i++) {
        st = 2.0 * rotate(st, 0.05);
        f += fbm(st + f / a - 0.005 * time);
        a *= 0.5;
    }
    
    return f;
}

void main() {
    color = vec4(vec3(ocean(uv)), 1.0);
}