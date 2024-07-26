#version 330 core

uniform vec2 resolution;
uniform float time;
uniform sampler2D image;
in vec2 uv;
out vec4 color;

void main()
{
    color = texture(image, uv);
}
