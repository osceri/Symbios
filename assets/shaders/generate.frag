#version 330 core

uniform vec2 resolution;
uniform float time;
uniform sampler2D source;
uniform sampler2D image;
in vec2 uv;
out vec4 color;

struct ztj {
    float distance;
    vec3 position;
    vec3 normal;
    vec3 incidence;
    float travel;
    vec3 color;
};

ztj sphere(vec3 color, vec3 center, float radius, vec3 x) {
    return ztj(
        length(x - center) - radius,
        x,
        normalize(x - center),
        vec3(0.0),
        1000000.,
        color
    );
}


ztj union(ztj a, ztj b) {
    return a.distance < b.distance ? a : b;
}

ztj scene(vec3 p) {
    ztj s_A = sphere(
        vec3(0.0, 1.0, 0.0),
        1.2 * vec3(sin(time / 10.), cos(time / 10.), 5.0),
        1.0,
        p
    );

    ztj s_B = sphere(
        vec3(1.0, 0.0, 0.0),
        1.2 * vec3(sin(time / 10. + 3.14), cos(time / 10. + 3.14), 6.0),
        1.0,
        p
    );

    return union(s_A, s_B);
}

ztj raymarch(vec3 origin, vec3 ray) {
    ztj Z;
    Z.distance = 10000000.;
    float t = 0.0;
    vec3 p = origin;

    for(int i = 0; i < 100; i++) {
        p = origin + t * ray;
        Z = scene(p);
        if(Z.distance < 0.001) {
            break;
        }
        t += Z.distance;
    }

    Z.travel = t;
    Z.incidence = ray;
    return Z;
}

float compute_shadow(vec3 p, vec3 normal, vec3 ray) {
    vec3 light = 3. * normalize(vec3(1.0, 1.0, -1.0));
    vec3 half = normalize(light - ray);
    float ambient = 0.1;
    float diffuse = max(dot(normal, light), 0.0);
    float specular = pow(max(dot(normal, half), 0.0), 32.0);

    return clamp(ambient + diffuse + specular, 0.2, 1.);
}

void main() {
    // use ray-marching to render a sphere using phong shading
    // camera
    vec3 camera = vec3(0.0, 0.0, 0.0);
    // ray direction
    vec3 ray = normalize(vec3(
        2. * uv.x - 1.,
        1. - 2. * uv.y,
        1.0
    ));
    vec3 origin = camera;
    ztj hit = raymarch(origin, ray);

    if (hit.distance < 0.001) {
        color.xyz = vec3(compute_shadow(hit.position, hit.normal, hit.incidence) * hit.color);
        color.w = 1.0;
    }
    else {
        color = texture(source, uv);
        color = vec4(0.0, 0.0, 0.0, 1.0);
    }
}