uniform vec3 uEyePosInWorld;

uniform vec3 uMinPosLeft;
uniform vec3 uMinPosRight;
uniform vec3 uMaxPosLeft;
uniform vec3 uMaxPosRight;

varying vec2 vUv;

#ifdef TEXTURE
  uniform float uVerticalShift;
  uniform sampler2D uSampler;
#endif

void main(void) {
    gl_FragColor = vec4(0., 0., 0., 1.);

    #ifdef TEXTURE
      vec2 uv1 = vUv;
      #ifdef SCREEN
        uv1 = 1.-uv1;
      #endif

      vec3 pos = computePos(uv1, uMinPosLeft, uMinPosRight, uMaxPosLeft, uMaxPosRight);

      vec3 eyeToPosDir = normalize(pos-uEyePosInWorld);

      vec2 uv = computeUv(eyeToPosDir, uVerticalShift);

      vec4 skyData = texture2D(uSampler, uv);
      vec3 color = skyData.rgb;

      gl_FragColor = vec4(color, 1.);
    #endif
}
