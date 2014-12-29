varying vec2 vUv;

#ifdef TEXTURE
  uniform sampler2D uSampler;
#endif

void main(void) {
    gl_FragColor = vec4(0., 0., 0., 1.);

    #ifdef TEXTURE
      vec2 uv1 = vUv;
      #ifndef SCREEN
        uv1 = 1.-uv1;
      #endif

      gl_FragColor = texture2D(uSampler, uv1);
    #endif
}
