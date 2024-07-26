#version 330 core

uniform vec2 resolution;
uniform float time;
uniform sampler2D target; // iChannel0 equivalent
uniform sampler2D anchor; // iChannel1 equivalent
in vec2 uv;
out vec4 color;

float sx(vec2 x) {
    return texture(target, x).x;
}

float nx(vec2 x) {
    return texture(anchor, x).x;
}


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


void main() {
    vec2 x = uv;

    float delta = 0.;
    for (int i = -1; i < 2; i++) {
        for (int j = -1; j < 2; j++) {
            if (i == 0 && j == 0) continue;
            vec2 dx = vec2(i, j) / resolution;
            delta += (sx(x) - sx(x + dx)) / length(dx);
        }
    }


    if (time < 0.01) {
        color = vec4(vec3(nx(x)), 1.);
    }
    else {
        color = vec4(vec3(sx(x) - 0.001 * delta + 0.1 * fbm(x - 0.5 * time)), 1.);
    }
}
