#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 position;

uniform mat4 uWorld;
uniform mat4 uViewProjection;

void main(void) {
    gl_Position = uViewProjection * uWorld * vec4(position, 1.0);
}
