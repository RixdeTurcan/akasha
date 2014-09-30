#ifndef PI
  #define PI 3.14159265359
#endif

varying vec3 vNormal;
varying vec3 vVertexPosInWorld;
uniform vec3 uEyePosInWorld;
uniform float uHorizonDist;
uniform vec3 uSeaColor;

// Lights
#ifdef LIGHT0
  uniform vec4 uLightData0;
  uniform vec3 uLightDiffuse0;
  uniform vec3 uLightSpecular0;
  #ifdef SHADOW0
    varying vec4 vPositionFromLight0;
    uniform sampler2D shadowSampler0;
    uniform float darkness0;
  #endif
#endif

#ifdef LIGHT1
  uniform vec4 uLightData1;
  uniform vec3 uLightDiffuse1;
  uniform vec3 uLightSpecular1;
  #ifdef SHADOW1
    varying vec4 vPositionFromLight1;
    uniform sampler2D shadowSampler1;
    uniform float darkness1;
  #endif
#endif

#ifdef FOG
  uniform vec4 uFogInfos;
#endif

//Compute the normal shift due to the wind
#ifdef BUMP
    varying vec2 vBumpUV;
    uniform vec2 uBumpInfos;
    uniform sampler2D uBumpSampler;
    uniform float uWindWaveFactorAmplitudeNormal;
    uniform float uWindWaveFactorAmplitudeReflection;
    uniform float uTime;
#endif

//Refleciton and refraction
#ifdef REFLECTION
    uniform sampler2D uReflectionSampler;
    uniform mat4 uReflectionMatrix;
    uniform mat4 uView;
    uniform float uReflectionFactor;

    #ifdef REFRACTION
        uniform sampler2D uRefractionSampler;
    #endif
#endif

//Turbidity
#ifdef SEABED
    uniform sampler2D uSeabedSampler;
    uniform float uTurbidityFactor;
#endif

//Foam
#ifdef FOAM
    varying vec4 vFoamcolor;
    #ifdef DIFFUSE
        varying vec2 vDiffuseUV;
        uniform sampler2D uDiffuseSampler;
        uniform vec2 uDiffuseInfos;
    #endif
#endif

//Sky
#ifdef SKY
    uniform sampler2D uSkySampler;
    uniform float uVerticalShift;
    uniform float uSkyReflectionFactor;
    uniform float uSkyReflectionAbsorbtion;
#endif

//Cloud
#ifdef CLOUD
    uniform sampler2D uCloudSampler;
    uniform vec3 uSunDir;
    uniform vec3 uDeltaPlayerSkyPos;
    uniform float uCloudHeight;
    uniform float uShadowDarkness;
    uniform float uShadowHardness;
#endif

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

  //Clip distance (horizon)
  if (eyeToVertexDist>uHorizonDist)
  {
    gl_FragColor = vec4(skyColor, 1.);
    return;
  }

  //Compute shadows
  float shadow = 1.;

  //Compute cloud shadow
  #ifdef CLOUD
    float alpha = (uCloudHeight-vVertexPosInWorld.y)/max(uSunDir.y, 0.01);
    vec3 cloudPos = vVertexPosInWorld + alpha * uSunDir;
    cloudPos.xz += uDeltaPlayerSkyPos.xz;
    vec3 eyeToCloudPosDir = normalize(cloudPos);
    vec4 texCloud = texture2D(uCloudSampler, computeUv(eyeToCloudPosDir));

    shadow *= 1.- min(uShadowDarkness*smoothstep(0., uShadowHardness, texCloud.r), 1.);
  #endif


  #ifdef LIGHT0
    float shadow0 = 1.;
    #ifdef SHADOW0
      shadow0 = computeShadow(vPositionFromLight0, shadowSampler0, darkness0);
    #endif
    shadow *= shadow0;
  #endif

  #ifdef LIGHT1
    float shadow1 = 1.;
    #ifdef SHADOW1
      shadow1 = computeShadow(vPositionFromLight1, shadowSampler1, darkness1);
    #endif
    shadow *= shadow1;
  #endif


  //Compute the vertex normal (bump map)
  vec3 normal = vNormal;
  #ifdef BUMP
    vec3 bumpTex = texture2D(uBumpSampler, vBumpUV).xyz;
    bumpTex.z /= uWindWaveFactorAmplitudeNormal;
    normal = perturbNormal(eyeToVertexDir, normal, bumpTex,
                           uBumpInfos, vBumpUV);
  #endif


  //Compute the light diffuse color
  vec3 diffuseColor = vec3(0.0, 0.0, 0.0);
  vec3 diffuseColorSea = vec3(0.0, 0.0, 0.0);
  vec3 lightVectorW;
  #ifdef LIGHT0
    #ifdef LIGHT0_TYPE_POINT
      lightVectorW = normalize(uLightData0.xyz - vVertexPosInWorld);
    #endif
    #ifdef LIGHT0_TYPE_DIR
      lightVectorW = normalize(-uLightData0.xyz);
    #endif
    diffuseColor += uLightDiffuse0 * computeDiffuseFactor(lightVectorW, normal, 0.25, 0.5) * shadow0;
    diffuseColorSea += uLightDiffuse0 * computeDiffuseFactor(lightVectorW, normal, 0.5, 0.5);
  #endif
  #ifdef LIGHT1
    #ifdef LIGHT1_TYPE_POINT
      lightVectorW = normalize(uLightData1.xyz - vVertexPosInWorld);
    #endif
    #ifdef LIGHT1_TYPE_DIR
      lightVectorW = normalize(-uLightData1.xyz);
    #endif
    diffuseColor += uLightDiffuse1 * computeDiffuseFactor(lightVectorW, normal, 0.25, 0.5) * shadow1;
    diffuseColorSea += uLightDiffuse1 * computeDiffuseFactor(lightVectorW, normal, 0.5, 0.5);
  #endif


  //Compute the reflection+refraction color
  vec3 refColor = vec3(0., 0., 0.);

  #ifdef REFLECTION
    vec3 reflectionUVW = (uReflectionMatrix * (uView * vec4(vVertexPosInWorld, 1.))).xyz;

    //Compute the shift due to the vertex normal and the wind
    vec2 normalShift = uReflectionFactor*vVertexPosInWorld.y*normal.xz;
    vec2 windShift = vec2(0., 0.);
    #ifdef BUMP
      vec3 bumpNormal = 2. * bumpTex - 1.;
      windShift = uWindWaveFactorAmplitudeReflection * bumpNormal.xy;
    #endif

    //Compute texture coordinates
    vec2 coord = reflectionUVW.xy / reflectionUVW.z;
    coord.y = 1. - coord.y;
    vec2 perturbCoord = coord + normalShift + windShift;


    //Compute fresnel value
    float fresnel = dot(eyeToVertexDir, normal);

    //Mix the final reflection+refraction color
    refColor = texture2D(uReflectionSampler, perturbCoord).rgb;

    //Compute the sky reflection color
    #ifdef SKY
      vec3 dirRef = reflect(-eyeToVertexDir, normalize(normal+vec3(0., uSkyReflectionFactor, 0.)));
      vec2 uvSkyRef = computeUv(dirRef, uVerticalShift);

      vec3 skyRefColor = texture2D(uSkySampler, uvSkyRef).rgb
                       * (0.5-0.5*dot(normal, uLightData0.xyz)) //sun shadow
                       * uSkyReflectionAbsorbtion; //Absorbtion

      refColor += skyRefColor;
    #endif

    //Compute the refraction color
    vec3 refractionColor = vec3(0., 0., 0.);
    #ifdef REFRACTION
      refractionColor = texture2D(uRefractionSampler, perturbCoord).rgb;

      //Compute the turbidity
      #ifdef SEABED
        float seabedDist = 1./max(texture2D(uSeabedSampler, coord).r, 0.0001);

        float waterDepth = max(seabedDist-eyeToVertexDist, 0.);
        float turbidity = exp(-waterDepth*uTurbidityFactor);

        refractionColor = mix(uSeaColor*diffuseColorSea, refractionColor, turbidity);
      #endif
    #endif

    refColor = mix(refColor, refractionColor, fresnel);
  #endif

  color.rgb = refColor * shadow;




  //Compute foam color
  #ifdef FOAM
    //Compute the foam texture color
    vec3 diffuseBaseColor = vec3(1., 1., 1.);
    #ifdef DIFFUSE
      diffuseBaseColor = texture2D(uDiffuseSampler, vDiffuseUV).rgb;
    #endif

    //mix the foam color
    diffuseColor *= diffuseBaseColor * clamp(vFoamcolor.r, 1., 1.5);
    color.rgb = mix(color.rgb, diffuseColor, clamp(vFoamcolor.r, 0., 1.));
  #endif

  //Compute the fog color
  #ifdef FOG
    color.rgb = mix(clamp(skyColor.rgb, 0., 1.), color.rgb, CalcFogFactor(eyeToVertexDist, uFogInfos));
  #endif

  gl_FragColor = color;
}




