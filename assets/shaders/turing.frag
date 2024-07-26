#version 330 core

uniform vec2 resolution;
uniform float time;
uniform sampler2D target; // iChannel0 equivalent
uniform sampler2D anchor; // iChannel1 equivalent
in vec2 uv;
out vec4 color;

vec3 sx(vec2 x) {
    return texture(target, x).xyz;
}

float noise(vec2 x) {
    return texture(anchor, x).x;
}

vec3 nx(vec2 x) {
    // simplex noise, make each channel different

    vec3 n = vec3(
        0.5 * (1.0 + sin(6.28318 * noise(1.0 * x))),
        0.5 * (1.0 + sin(6.28318 * noise(0.6 * x))),
        0.5 * (1.0 + sin(6.28318 * noise(0.3 * x)))
    );

    return n;
}

vec3 average(int I, vec2 x) {
    vec3 sum = vec3(0.0);
    float weg = 0.0;
    vec2 dx;
    float d;
    
    for (int i = 1 - I; i < I; i++) {
        for (int j = 1 - I; j < I; j++) {
            dx = 1.0 * vec2(float(i), float(j)) / resolution;
            d = exp(-length(dx));
            weg += d;
            sum += d * sx(x + dx);
        }
    }
    return sum / weg;
}

vec3 gray(vec3 x) {
    return vec3(dot(x, vec3(0.299, 0.587, 0.114)));
}

vec3 sigmoid(vec3 x) {
    return 1.0 / (1.0 + exp(-x));
}

vec3 q(int a, int b, vec2 x) {
    return average(a, x) - average(b, x);
}

void main() {
    vec2 x = uv;

    vec3 col = vec3(0.0);

    if (time < 0.01) {
        col = nx(x);
    } else {
        col = sx(x)
            - 0.11 * q(5, 2, x)
            + 0.21 * q(3, 2, x) 
            ;
    }

    color = vec4(col, 1.0);
}
