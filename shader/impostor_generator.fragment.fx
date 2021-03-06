#ifdef DIFFUSE
  uniform sampler2D uDiffuseSampler;
  varying vec2 vDiffuseUV;
#endif


#ifndef RENDER_COLOR
  #ifdef BUMP
    uniform sampler2D uBumpSampler;
    uniform vec2 uBumpInfos;

    varying vec2 vBumpUV;

    varying vec3 vNormal;
    varying vec3 vTangent;
    varying vec3 vBitangent;
  #endif
#endif


void main(void) {

  vec4 color = vec4(0., 0., 0., 0.);
  #ifdef DIFFUSE
     color = texture2D(uDiffuseSampler, vDiffuseUV);
  #endif

  if (color.a<0.5)
  {
    discard;
  }
  color.a = 1.;

  #ifndef RENDER_COLOR
    #ifdef BUMP
      vec3 perturbNormal = texture2D(uBumpSampler, vBumpUV).rgb*2.-1.;
      mat3 tbn = mat3(vTangent, vBitangent, vNormal);

      vec3 n = tbn * perturbNormal;

      if (!gl_FrontFacing)
      {
        n *= -1.;
      }

      color.rgb = (n + 1.)*0.5;
    #endif
  #endif

  //Premultiplied alpha
  #ifdef PREMUL_ALPHA
   // color.rgb *= color.a;
  #endif
  gl_FragColor = color;
}
