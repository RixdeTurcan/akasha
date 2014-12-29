#ifndef DEPTH
  #define DEPTH 0.
#endif

attribute vec2 uv;

varying vec2 vUv;

void main(void) {
    gl_Position = vec4(uv, DEPTH, 1.);
    vUv = 1.-0.5*(1.+uv);
    #ifdef SCREEN
      vUv = 1. - vUv;
    #endif
}
