
uniform vec3 uEyePosInWorld;
uniform vec3 uPlayerPos;

// Sky
#ifdef SKY
    uniform sampler2D uSkySampler;
    uniform float uVerticalShift;
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

//Diffuse
#ifdef DIFFUSE_1
  uniform sampler2D uDiffuse1Sampler;
  float uDiffuse1UvFactor = 90.;

#endif
#ifdef DIFFUSE_NORMAL_1
  uniform sampler2D uDiffuseNormal1Sampler;
  float uDiffuseNormal1UvFactor = 100.;
  float uDiffuseNormal1Limit = -1.;
  float uDiffuseNormal1Slope = 0.;
#endif
#ifdef DIFFUSE_FAR_1
  uniform sampler2D uDiffuseFar1Sampler;
  float uDiffuseFar1UvFactor = 100.;
  float uDiffuseFar1Limit = -1.;
  float uDiffuseFar1Slope = 0.;
#endif

#ifdef DIFFUSE_2
  uniform sampler2D uDiffuse2Sampler;
  float uDiffuse1To2Height = 110.;
  float uDiffuse1To2Slope = 60.;
  float uDiffuse2UvFactor = 100.;
#endif
#ifdef DIFFUSE_NORMAL_2
  uniform sampler2D uDiffuseNormal2Sampler;
  float uDiffuseNormal2UvFactor = 100.;
  float uDiffuseNormal2Limit = 0.7;
  float uDiffuseNormal2Slope = 0.2;
#endif
#ifdef DIFFUSE_FAR_2
  uniform sampler2D uDiffuseFar2Sampler;
  float uDiffuseFar2UvFactor = 100.;
  float uDiffuseFar2Limit = 4000.;
  float uDiffuseFar2Slope = 500.;
#endif

#ifdef DIFFUSE_3
  uniform sampler2D uDiffuse3Sampler;
  float uDiffuse2To3Height = 700.;
  float uDiffuse2To3Slope = 200.;
  float uDiffuse3UvFactor = 100.;
#endif
#ifdef DIFFUSE_NORMAL_3
  uniform sampler2D uDiffuseNormal3Sampler;
  float uDiffuseNormal3UvFactor = 100.;
  float uDiffuseNormal3Limit = 0.5;
  float uDiffuseNormal3Slope = 0.3;
#endif
#ifdef DIFFUSE_FAR_3
  uniform sampler2D uDiffuseFar3Sampler;
  float uDiffuseFar3UvFactor = 100.;
  float uDiffuseFar3Limit = -1.;
  float uDiffuseFar3Slope = 0.;
#endif

// Fog
#ifdef FOG
  uniform vec4 uFogInfos;
#endif

varying vec3 vVertexPosInWorld;
varying vec3 vNormal;
varying float vDiffuseHeightOffset;

void main(void) {
  vec4 color = vec4(0., 0., 0., 1.);

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

  //Compute the vertex normal (bump map)
  vec3 normal = vNormal;

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
    diffuseColor += uLightDiffuse0 * computeDiffuseFactor(lightVectorW, normal, 1.5, 0.25);
  #endif
  #ifdef LIGHT1
    #ifdef LIGHT1_TYPE_POINT
      lightVectorW = normalize(uLightData1.xyz - vVertexPosInWorld);
    #endif
    #ifdef LIGHT1_TYPE_DIR
      lightVectorW = normalize(-uLightData1.xyz);
    #endif
    diffuseColor += uLightDiffuse1 * computeDiffuseFactor(lightVectorW, normal, 1.5, 0.25);
  #endif


  //Compute diffuse factors
  #ifdef DIFFUSE_1
    float diffuseFactor1 = 1.;

    #ifdef DIFFUSE_2
      float diffuseFactor2 = smoothstep(uDiffuse1To2Height+vDiffuseHeightOffset-uDiffuse1To2Slope, uDiffuse1To2Height+vDiffuseHeightOffset+uDiffuse1To2Slope, vVertexPosInWorld.y);
      diffuseFactor1 *= 1. - diffuseFactor2;

      #ifdef DIFFUSE_3
        float diffuseFactor3 = smoothstep(uDiffuse2To3Height+vDiffuseHeightOffset-uDiffuse2To3Slope, uDiffuse2To3Height+vDiffuseHeightOffset+uDiffuse2To3Slope, vVertexPosInWorld.y);
        diffuseFactor2 *= 1. - diffuseFactor3;

      #endif
    #endif
  #endif


  //Compute diffuse normal factors
  float cosNormalAngle = dot(normal, vec3(0., 1., 0.));
  #ifdef DIFFUSE_NORMAL_1
    float diffuseNormal1Factor = smoothstep(uDiffuseNormal1Limit+uDiffuseNormal1Slope, uDiffuseNormal1Limit-uDiffuseNormal1Slope, cosNormalAngle);
  #endif
  #ifdef DIFFUSE_NORMAL_2
    float diffuseNormal2Factor = smoothstep(uDiffuseNormal2Limit+uDiffuseNormal2Slope, uDiffuseNormal2Limit-uDiffuseNormal2Slope, cosNormalAngle);
  #endif
  #ifdef DIFFUSE_NORMAL_3
    float diffuseNormal3Factor = smoothstep(uDiffuseNormal3Limit+uDiffuseNormal3Slope, uDiffuseNormal3Limit-uDiffuseNormal3Slope, cosNormalAngle);
  #endif


  //Compute diffuse far factors
  #ifdef DIFFUSE_FAR_1
    float diffuseFar1Factor = smoothstep(uDiffuseFar1Limit-uDiffuseFar1Slope, uDiffuseFar1Limit+uDiffuseFar1Slope, eyeToVertexDist);
  #endif
  #ifdef DIFFUSE_FAR_2
    float diffuseFar2Factor = smoothstep(uDiffuseFar2Limit-uDiffuseFar2Slope, uDiffuseFar2Limit+uDiffuseFar2Slope, eyeToVertexDist);
  #endif
  #ifdef DIFFUSE_FAR_3
    float diffuseFar3Factor = smoothstep(uDiffuseFar3Limit-uDiffuseFar3Slope, uDiffuseFar3Limit+uDiffuseFar3Slope, eyeToVertexDist);
  #endif


  //Compute diffuse uvs
  #ifdef DIFFUSE_1
    vec2 diffuse1Uv = mod(vVertexPosInWorld.xz+uPlayerPos.xz, uDiffuse1UvFactor)/uDiffuse1UvFactor;
  #endif
  #ifdef DIFFUSE_NORMAL_1
    vec2 diffuseNormal1Uv = mod(vVertexPosInWorld.xz+uPlayerPos.xz, uDiffuseNormal1UvFactor)/uDiffuseNormal1UvFactor;
  #endif
  #ifdef DIFFUSE_FAR_1
    vec2 diffuseFar1Uv = mod(vVertexPosInWorld.xz+uPlayerPos.xz, uDiffuseFar1UvFactor)/uDiffuseFar1UvFactor;
  #endif

  #ifdef DIFFUSE_2
    vec2 diffuse2Uv = mod(vVertexPosInWorld.xz+uPlayerPos.xz, uDiffuse2UvFactor)/uDiffuse2UvFactor;
  #endif
  #ifdef DIFFUSE_NORMAL_2
    vec2 diffuseNormal2Uv = mod(vVertexPosInWorld.xz+uPlayerPos.xz, uDiffuseNormal2UvFactor)/uDiffuseNormal2UvFactor;
  #endif
  #ifdef DIFFUSE_FAR_2
    vec2 diffuseFar2Uv = mod(vVertexPosInWorld.xz+uPlayerPos.xz, uDiffuseFar2UvFactor)/uDiffuseFar2UvFactor;
  #endif

  #ifdef DIFFUSE_3
    vec2 diffuse3Uv = mod(vVertexPosInWorld.xz+uPlayerPos.xz, uDiffuse3UvFactor)/uDiffuse3UvFactor;
  #endif
  #ifdef DIFFUSE_NORMAL_3
    vec2 diffuseNormal3Uv = mod(vVertexPosInWorld.xz+uPlayerPos.xz, uDiffuseNormal3UvFactor)/uDiffuseNormal3UvFactor;
  #endif
  #ifdef DIFFUSE_FAR_3
    vec2 diffuseFar3Uv = mod(vVertexPosInWorld.xz+uPlayerPos.xz, uDiffuseFar3UvFactor)/uDiffuseFar3UvFactor;
  #endif


  //Compute the diffuseBaseColor
  vec3 diffuseBaseColor = vec3(0., 0., 0.);
  vec3 diffuseTex = vec3(0., 0., 0.);
  #ifdef DIFFUSE_1
    if (diffuseFactor1>0.)
    {
      diffuseTex = texture2D(uDiffuse1Sampler, diffuse1Uv).rgb;
      #ifdef DIFFUSE_FAR_1
        diffuseTex = mix(diffuseTex, texture2D(uDiffuseFar1Sampler, diffuseFar1Uv).rgb, diffuseFar1Factor);
      #endif
      #ifdef DIFFUSE_NORMAL_1
        diffuseTex = mix(diffuseTex, texture2D(uDiffuseNormal1Sampler, diffuseNormal1Uv).rgb, diffuseNormal1Factor);
      #endif
      diffuseBaseColor = diffuseTex;
    }
    #ifdef DIFFUSE_2
      if (diffuseFactor2>0.)
      {
        if (diffuseFactor1>0.)
        {
          diffuseTex = texture2D(uDiffuse2Sampler, diffuse2Uv).rgb;
          #ifdef DIFFUSE_FAR_2
            diffuseTex = mix(diffuseTex, texture2D(uDiffuseFar2Sampler, diffuseFar2Uv).rgb, diffuseFar2Factor);
          #endif
          #ifdef DIFFUSE_NORMAL_2
            diffuseTex = mix(diffuseTex, texture2D(uDiffuseNormal2Sampler, diffuseNormal2Uv).rgb, diffuseNormal2Factor);
          #endif

          diffuseBaseColor = mix(diffuseBaseColor, diffuseTex , diffuseFactor2);
        }
        else
        {
          diffuseTex = texture2D(uDiffuse2Sampler, diffuse2Uv).rgb;
          #ifdef DIFFUSE_FAR_2
            diffuseTex = mix(diffuseTex, texture2D(uDiffuseFar2Sampler, diffuseFar2Uv).rgb, diffuseFar2Factor);
          #endif
          #ifdef DIFFUSE_NORMAL_2
            diffuseTex = mix(diffuseTex, texture2D(uDiffuseNormal2Sampler, diffuseNormal2Uv).rgb, diffuseNormal2Factor);
          #endif
          diffuseBaseColor = diffuseTex;
        }
      }
      #ifdef DIFFUSE_3
        if (diffuseFactor3>0.)
        {
          if (diffuseFactor2>0.)
          {
            diffuseTex = texture2D(uDiffuse3Sampler, diffuse3Uv).rgb;
            #ifdef DIFFUSE_FAR_3
              diffuseTex = mix(diffuseTex, texture2D(uDiffuseFar3Sampler, diffuseFar3Uv).rgb, diffuseFar3Factor);
            #endif
            #ifdef DIFFUSE_NORMAL_3
              diffuseTex = mix(diffuseTex, texture2D(uDiffuseNormal3Sampler, diffuseNormal3Uv).rgb, diffuseNormal3Factor);
            #endif
            diffuseBaseColor = mix(diffuseBaseColor, diffuseTex, diffuseFactor3);
          }
          else
          {
            diffuseTex = texture2D(uDiffuse3Sampler, diffuse3Uv).rgb;
            #ifdef DIFFUSE_FAR_3
              diffuseTex = mix(diffuseTex, texture2D(uDiffuseFar3Sampler, diffuseFar3Uv).rgb, diffuseFar3Factor);
            #endif
            #ifdef DIFFUSE_NORMAL_3
              diffuseTex = mix(diffuseTex, texture2D(uDiffuseNormal3Sampler, diffuseNormal3Uv).rgb, diffuseNormal3Factor);
            #endif
            diffuseBaseColor = diffuseTex;
          }
        }
      #endif
    #endif
  #endif


  color.rgb = diffuseColor * diffuseBaseColor;

  //Compute the fog color
  #ifdef FOG
    color.rgb = mix(clamp(skyColor, 0., 1.), color.rgb, CalcFogFactor(eyeToVertexDist, uFogInfos));
  #endif

  gl_FragColor = color;
}
