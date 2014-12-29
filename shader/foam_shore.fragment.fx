varying float vHeight;
varying vec3 vNormal;

void main(void) {
  gl_FragColor = vec4(vHeight, vNormal.xz*0.5+0.5, 1.);
}
