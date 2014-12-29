#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 position;

uniform mat4 world;
uniform mat4 viewProjection;

void main(void) {
    gl_Position = viewProjection * world * vec4(position, 1.0);
}
