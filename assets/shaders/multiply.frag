#version 330 core

uniform vec2 resolution;
uniform float time;
uniform sampler2D source_1;
uniform sampler2D source_2;
uniform sampler2D image;
in vec2 uv;
out vec4 color;

void main() {
    color = texture(source_1, uv) * texture(source_2, uv);
}