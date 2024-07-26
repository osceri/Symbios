#version 330 core

uniform vec2 resolution;
uniform float time;
in vec2 uv;
out vec4 color;

void main()
{
    color = vec4(uv.xy, 0.5, 1.0); // A simple gradient effect
}
