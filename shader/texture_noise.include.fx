#ifdef NOISE_TEXTURE
  uniform sampler2D uNoiseSampler;
#endif

float computeOctaves(vec3 amplitudes, vec2 period, vec2 param, vec2 deltaPos, float shanonMargin)
{
  float factorX1 = smoothstep(shanonMargin/(2.*period.x), shanonMargin/(1.*period.x), deltaPos.x);
  float factorX2 = smoothstep(shanonMargin/(4.*period.x), shanonMargin/(2.*period.x), deltaPos.x);
  float factorX3 = smoothstep(shanonMargin/(8.*period.x), shanonMargin/(4.*period.x), deltaPos.x);

  float factorY1 = smoothstep(shanonMargin/(2.*period.y), shanonMargin/(1.*period.y), deltaPos.y);
  float factorY2 = smoothstep(shanonMargin/(4.*period.y), shanonMargin/(2.*period.y), deltaPos.y);
  float factorY3 = smoothstep(shanonMargin/(8.*period.y), shanonMargin/(4.*period.y), deltaPos.y);

  #ifdef NOISE_TEXTURE
      vec4 tex = texture2D(uNoiseSampler, period*param/10.)*2.-1.;
      return (1.-factorX1)*(1.-factorY1)*amplitudes.x*tex.r
           + (1.-factorX2)*(1.-factorY2)*amplitudes.y*tex.g
           + (1.-factorX3)*(1.-factorY3)*amplitudes.z*tex.b;
  #elif
      return  0.;
  #endif
}
