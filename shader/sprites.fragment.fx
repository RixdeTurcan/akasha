uniform vec3 uEyePosInWorld;
uniform vec3 uPlayerPos;

#ifdef DIFFUSE
  uniform sampler2D uDiffuseSampler;
#endif

#ifdef BUMP
  uniform sampler2D uBumpSampler;
  varying vec3 vNormal;
  varying vec3 vBitangent;
  varying vec3 vTangent;
#endif

// Sky
#ifdef SKY
    uniform sampler2D uSkySampler;
    uniform float uVerticalShift;
#endif

// Fog
#ifdef FOG
  uniform vec4 uFogInfos;
#endif

// Lights
#ifdef LIGHT0
  uniform vec4 uLightData0;
  uniform vec3 uLightDiffuse0;
#endif

#ifdef LIGHT1
  uniform vec4 uLightData1;
  uniform vec3 uLightDiffuse1;
#endif

varying vec3 vVertexPosInWorld;

uniform float uNbRows;
uniform float uNbCols;

varying float vAngleFactor;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vCoord1;
varying vec2 vCoord2;

vec4 textureSprite2D(sampler2D sampler)
{
  if (vAngleFactor<=0.001)
  {
    vec2 uv1 = (vec2(clamp(vUv1.x, 0., 1.), vUv2.y)+vCoord1)/(vec2(uNbRows, uNbCols));
    vec4 t1 = texture2D(sampler, uv1);

    return t1;
  }
  else if (vAngleFactor>0.999)
  {
    vec2 uv2 = (vec2(clamp(vUv2.x, 0., 1.), vUv2.y)+vCoord2)/(vec2(uNbRows, uNbCols));
    vec4 t2 = texture2D(sampler, uv2);

    return t2;
  }
  else
  {
    vec2 uv1 = (vec2(clamp(vUv1.x, 0., 1.), vUv2.y)+vCoord1)/(vec2(uNbRows, uNbCols));
    vec4 t1 = texture2D(sampler, uv1);

    vec2 uv2 = (vec2(clamp(vUv2.x, 0., 1.), vUv2.y)+vCoord2)/(vec2(uNbRows, uNbCols));
    vec4 t2 = texture2D(sampler, uv2);

    vec4 tMix = mix(t1, t2, vAngleFactor);

    return tMix;
  }
}


void main() {
  vec4 color = vec4(0., 0., 0., 0.);

  //Compute the diffuseBaseColor
  vec4 diffuseBaseColor = vec4(0., 0., 0., 0.);
  #ifdef DIFFUSE
    diffuseBaseColor = textureSprite2D(uDiffuseSampler);
  #endif


  #ifdef ALPHA_TESTING
    if (diffuseBaseColor.a<0.5)
    {
      discard;return;
    }
    diffuseBaseColor*=diffuseBaseColor.a;
    diffuseBaseColor.a = 1.;
  #endif

  #ifndef ALPHA_TESTING
    if (diffuseBaseColor.a<0.1)
    {
      discard;return;
    }
  #endif

  //Compute the direction and the distance eye -> vertex
  vec3 eyeToVertexDir = uEyePosInWorld-vVertexPosInWorld;
  float eyeToVertexDist = length(eyeToVertexDir);
  eyeToVertexDir = normalize(eyeToVertexDir);

  //Compute the sky color
  vec3 skyColor = vec3(0., 0., 0.);

  #ifdef SKY
    vec2 uvSky = computeUv(-eyeToVertexDir, uVerticalShift);
    vec4 skyTex = texture2D(uSkySampler, uvSky);
    skyColor = skyTex.rgb;
  #endif


  //Compute the normal
  vec3 normal = vec3(0., 1., 0.);
  #ifdef BUMP
      vec3 perturbNormal = textureSprite2D(uBumpSampler).rgb*2.-1.;
      mat3 tbn = mat3(vTangent, vBitangent, vNormal);

      normal = tbn * perturbNormal;
  #endif


  //Compute the light color
  vec3 diffuseColor = vec3(0., 0., 0.);
  vec3 specularColor = vec3(0., 0., 0.);
  vec3 lightVectorW;
  #ifdef LIGHT0
    #ifdef LIGHT0_TYPE_POINT
      lightVectorW = normalize(uLightData0.xyz - vVertexPosInWorld);
    #endif
    #ifdef LIGHT0_TYPE_DIR
      lightVectorW = normalize(-uLightData0.xyz);
    #endif
    diffuseColor += uLightDiffuse0 * computeDiffuseFactor(lightVectorW, normal, 0.7, 1./(1.+0.7));
    specularColor += uLightDiffuse0 * computeSpecularFactor(lightVectorW, eyeToVertexDir, normal, 4.);
  #endif
  #ifdef LIGHT1
    #ifdef LIGHT1_TYPE_POINT
      lightVectorW = normalize(uLightData1.xyz - vVertexPosInWorld);
    #endif
    #ifdef LIGHT1_TYPE_DIR
      lightVectorW = normalize(-uLightData1.xyz);
    #endif
    diffuseColor += uLightDiffuse1 * computeDiffuseFactor(lightVectorW, normal, 0.7, 1./(1.+0.7));
    specularColor += uLightDiffuse1 * computeSpecularFactor(lightVectorW, eyeToVertexDir, normal, 4.);
  #endif

  float specularFactor = 0.4;
  float diffuseFactor = 0.6*1.5;

  color = vec4(diffuseColor * diffuseFactor + specularColor * specularFactor, 1.) * diffuseBaseColor;




  //Compute the fog color
  #ifdef FOG
    color.rgb = mix(clamp(skyColor, 0., 1.), color.rgb, CalcFogFactor(eyeToVertexDist, uFogInfos));
  #endif

  //Premultiplied alpha
  #ifdef PREMUL_ALPHA
    //color.rgb *= color.a;
    //color.a *= color.a * color.a;
  #endif
  gl_FragColor = color;
}
