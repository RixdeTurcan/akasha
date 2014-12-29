
varying vec2 vUv;
varying float vAlpha;
varying float vDepth;
varying float vDiffuseFactor;
varying vec3 vNormal;
uniform sampler2D uDiffuseSampler;


varying vec3 vVertexPosInWorld;
uniform vec3 uEyePosInWorld;

#ifndef PI
  #define PI 3.14159265359
#endif

// Fog
#ifdef FOG
    #define FOGMODE_NONE    0.
    #define FOGMODE_EXP     1.
    #define FOGMODE_EXP2    2.
    #define FOGMODE_LINEAR  3.
    #define E 2.71828

    uniform vec4 uFogInfos;
    uniform vec3 uFogColor;

    float CalcFogFactor()
    {
      float vFogDistance = length(uEyePosInWorld-vVertexPosInWorld);
      float fogCoeff = 1.0;
      float fogStart = uFogInfos.y;
      float fogEnd = uFogInfos.z;
      float fogDensity = uFogInfos.w;

      if (FOGMODE_LINEAR == uFogInfos.x)
      {
        fogCoeff = (fogEnd - vFogDistance) / (fogEnd - fogStart);
      }
      else if (FOGMODE_EXP == uFogInfos.x)
      {
        fogCoeff = 1.0 / pow(E, vFogDistance * fogDensity);
      }
      else if (FOGMODE_EXP2 == uFogInfos.x)
      {
        fogCoeff = 1.0 / pow(E, vFogDistance * vFogDistance * vFogDistance * fogDensity * fogDensity * fogDensity);
      }

      return clamp(fogCoeff, 0.0, 1.0);
    }
#endif

//Sky
#ifdef SKY
    uniform sampler2D uSkySampler;
    uniform float uVerticalShift;
#endif

void main(void)
{
  //Compute the direction and the distance eye -> vertex
  vec3 eyeToVertexDir = uEyePosInWorld-vVertexPosInWorld;
  float eyeToVertexDist = length(eyeToVertexDir);
  eyeToVertexDir = normalize(eyeToVertexDir);


  vec4 color = texture2D(uDiffuseSampler, 1.-vUv)*(0.5+0.5*dot(vNormal, vec3(1., 0.4, 1.)));;
  color.a *= vAlpha * smoothstep(0.4, 0.6, vDiffuseFactor);

  //Compute the sky color
  vec3 skyColor = vec3(0., 0., 0.);

  #ifdef SKY
    vec2 uvSky = vec2(atan(eyeToVertexDir.z, -eyeToVertexDir.x)/(2.*PI),
                      (eyeToVertexDir.y*0.5+0.5)-uVerticalShift);
    vec4 skyTex = texture2D(uSkySampler, uvSky);
    skyColor = clamp(skyTex.rgb, 0., 1.);
  #endif

  //Compute the fog color
  #ifdef FOG
    color.rgb = mix(clamp(skyColor, 0., 1.), color.rgb, CalcFogFactor());
  #endif

  gl_FragColor = color;
}
