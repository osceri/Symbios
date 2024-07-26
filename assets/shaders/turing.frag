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

vec3 nx(vec2 x) {
    return texture(anchor, x).xyz;
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

vec2 rotate(vec2 x, float a) {
    vec2 y = x - 0.5;
    y = vec2(y.x * cos(a) - y.y * sin(a), y.x * sin(a) + y.y * cos(a));
    return y + 0.5;
}

vec2 qdiv(float a, float b, vec2 x) {
    return vec2(
        (x.x - 0.5) * a + 0.5,
        (x.y - 0.5) * b + 0.5
    );
}

void main() {
    vec2 x = uv;

    vec3 col = vec3(0.0);

    if (time < 0.01) {
        col = nx(x);
    } else {
        col = gray(sx(x) 
            + 0.8 * q(5, 4, rotate(qdiv(1.2, 1.3, x), +0.03)) 
            - 0.2 * q(5, 3, rotate(qdiv(1.2, 1.4, x), -0.01)) 
            + 0.8 * q(3, 2, rotate(qdiv(1.3, 1.3, x), +0.03)) 
            - 0.7 * q(2, 1, rotate(qdiv(1.2, 1.1, x), -0.01))
        );
    }

    color = vec4(col, 1.0);
}
