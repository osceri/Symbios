#version 330 core

layout(location = 0) in vec2 position;

uniform vec2 resolution;
uniform float time;
uniform mat3 transform;
out vec2 uv;

void main()
{
    vec3 y = transform * vec3(position, 1.0);
    gl_Position = vec4(2. * y.xy - 1., 0.0, 1.0);
    uv = vec2(
        position.x,
        1. - position.y
    );
}
