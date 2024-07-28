#version 330 core

uniform vec2 resolution;
uniform float time;
uniform sampler2D source;
uniform sampler2D image;
in vec2 uv;
out vec4 color;

float mean(int kernel_size, vec2 uv) {
    float w = 0.0;
    float W = 0.0;
    float m = 0.0;

    for (int i = -kernel_size; i <= kernel_size; i++) {
        for (int j = -kernel_size; j <= kernel_size; j++) {
            vec2 dx = vec2(i, j) / resolution;

            w = exp(-length(dx)) * texture(source, uv + dx).w;
            m += w * texture(source, uv + dx).r;
            W += w;
        }
    }

    return m / W;
}

float sigmoid(float x) {
    return 1.0 / (1.0 + exp(-x));
}

void main() {
    float x = texture(source, uv).r;
    if (x < .3) {
        x += 4.7 * (mean(2, uv) - mean(1, uv));
    }
    if (.3 < x && x < .45) {
        x += 4.7 * (mean(3, uv) - mean(2, uv));
    }

    color = vec4(x, x, x, texture(source, uv).w);
}