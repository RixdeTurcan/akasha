varying vec2 vUv;

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

void main(void) {
  vec4 color = vec4(0., 0., 0., 0.);

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

  //Compute the diffuseBaseColor
  vec4 diffuseBaseColor = vec4(0., 0., 0., 0.);
  #ifdef DIFFUSE
    diffuseBaseColor = texture2D(uDiffuseSampler, vUv);
  #endif

  //Compute the normal
  vec3 normal = vec3(0., 1., 0.);
  #ifdef BUMP
      vec3 perturbNormal = texture2D(uBumpSampler, vUv).rgb*2.-1.;
      mat3 tbn = mat3(vTangent, vBitangent, vNormal);

      normal = tbn * perturbNormal;
  #endif

  //Compute the light diffuse color
  vec3 diffuseColor = vec3(0.0, 0.0, 0.0);
  vec3 lightVectorW;
  #ifdef LIGHT0
    #ifdef LIGHT0_TYPE_POINT
      lightVectorW = normalize(uLightData0.xyz - vVertexPosInWorld);
    #endif
    #ifdef LIGHT0_TYPE_DIR
      lightVectorW = normalize(-uLightData0.xyz);
    #endif
    diffuseColor += uLightDiffuse0 * computeDiffuseFactor(lightVectorW, normal, 0.7, 0.5);
  #endif
  #ifdef LIGHT1
    #ifdef LIGHT1_TYPE_POINT
      lightVectorW = normalize(uLightData1.xyz - vVertexPosInWorld);
    #endif
    #ifdef LIGHT1_TYPE_DIR
      lightVectorW = normalize(-uLightData1.xyz);
    #endif
    diffuseColor += uLightDiffuse1 * computeDiffuseFactor(lightVectorW, normal, 0.7, 0.5);
  #endif

  color = vec4(diffuseColor, 1.) * diffuseBaseColor;

  //Compute the fog color
  #ifdef FOG
    color.rgb = mix(clamp(skyColor, 0., 1.), color.rgb, CalcFogFactor(eyeToVertexDist, uFogInfos));
  #endif

  gl_FragColor = color;
}
