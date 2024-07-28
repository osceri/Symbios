#version 330 core

uniform vec2 resolution;
uniform float time;
uniform sampler2D source;
uniform sampler2D image;
in vec2 uv;
out vec4 color;

void main() {
    vec4 col = texture(source, uv);
    // estimate the darkness of the pixel
    float lightness = 0.5 * max(col.r, max(col.g, col.b)) + 0.5 * min(col.r, min(col.g, col.b));
    color = vec4(vec3(lightness), col.w);
}