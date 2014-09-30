uniform vec3 uEyePosInWorld;

varying vec3 vVertexPos;

void main(void) {

  //Get the distance between the camera and the vertex, then normalize it
  float dist = length(uEyePosInWorld-vVertexPos);

  gl_FragColor = vec4(1./max(dist, 0.0001), 0., 0., 1.);
}
