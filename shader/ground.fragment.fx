
uniform vec3 uEyePosInWorld;
uniform vec3 uPlayerPos;

varying vec3 vVertexPosInWorld;
varying vec3 vNormal;
varying float vDiffuseHeightOffset;


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
#endif
#ifdef DIFFUSE_FAR_1
  uniform sampler2D uDiffuseFar1Sampler;
  float uDiffuseFar1UvFactor = 100.;
#endif

#ifdef DIFFUSE_2
  uniform sampler2D uDiffuse2Sampler;
  float uDiffuse2UvFactor = 400.;
#endif
#ifdef DIFFUSE_NORMAL_2
  uniform sampler2D uDiffuseNormal2Sampler;
  float uDiffuseNormal2UvFactor = 100.;
#endif
#ifdef DIFFUSE_FAR_2
  uniform sampler2D uDiffuseFar2Sampler;
  float uDiffuseFar2UvFactor = 400.;
#endif

#ifdef DIFFUSE_3
  uniform sampler2D uDiffuse3Sampler;
  float uDiffuse3UvFactor = 100.;
#endif
#ifdef DIFFUSE_NORMAL_3
  uniform sampler2D uDiffuseNormal3Sampler;
  float uDiffuseNormal3UvFactor = 100.;
#endif
#ifdef DIFFUSE_FAR_3
  uniform sampler2D uDiffuseFar3Sampler;
  float uDiffuseFar3UvFactor = 100.;
#endif

// Fog
#ifdef FOG
  uniform vec4 uFogInfos;
#endif


#ifdef GRASS
  uniform sampler2D uGrassSampler;

  float uGrassHeight = 50.;
  float uGrassPeriod = 50.;
  float uInvGrassPeriod = 1./uGrassPeriod;
  varying float vDeltaPos;


  vec4 computeGrassTex(vec2 pos, float id)
  {
    if (pos.y>=uGrassHeight || pos.y<=0.)
    {
      return vec4(0., 0., 0., 0.);
    }
    else
    {
      float u = pos.x/(uGrassHeight*8.);
      float v = pos.y/(uGrassHeight*8.);

      vec2 uv = vec2(fract(u), v + floor(u)/4. + id/4.);

      return texture2D(uGrassSampler, uv);
    }

  }

  vec3 computeGrassColor(vec3 groundColor, float factor)
  {
    if (factor<=0.01)
    {
      return groundColor;
    }

    vec3 normal = vNormal;

    vec4 color = vec4(0., 0., 0., 0.);

    vec3 eyeToPosDir = normalize(uEyePosInWorld-vVertexPosInWorld);
    vec3 eyeToPosDirInv = vec3(1./eyeToPosDir.x,
                               1./eyeToPosDir.y,
                               1./eyeToPosDir.z);

    vec3 pos = vVertexPosInWorld + 8.*uGrassPeriod*eyeToPosDir;

    vec2 signGrass = vec2(1., 1.);
    if (eyeToPosDir.z>0.)
    {
      signGrass.y = -0.001;
    }
    if (eyeToPosDir.x>0.)
    {
      signGrass.x = -0.001;
    }

    float alpha = 0.;
    for(int i=0; i<16; i++)
    {
      float nextPosZId = floor((pos.z+uPlayerPos.z+uGrassPeriod*signGrass.y)*uInvGrassPeriod);
      float nextPosZ = nextPosZId*uGrassPeriod - uPlayerPos.z;

      float nextPosXId = floor((pos.x+uPlayerPos.x+uGrassPeriod*signGrass.x)*uInvGrassPeriod);
      float nextPosX = nextPosXId*uGrassPeriod - uPlayerPos.x;

      float alphaX = (nextPosZ-pos.z)*eyeToPosDirInv.z;
      float alphaZ = (nextPosX-pos.x)*eyeToPosDirInv.x;
      bool isX = alphaZ < alphaX;
      if (isX)
      {
        alpha = alphaX;
      }
      else
      {
        alpha = alphaZ;
      }

      pos += alpha*eyeToPosDir;


      if (dot(pos-vVertexPosInWorld, normal)>0.)
      {
         float offsetY = computeVertexPos(pos.xz, vDeltaPos*vec2(1., 1.), uPlayerPos.xz).y;

         float factor = smoothstep(0.3, 0.5, computeDiffuseFactors(offsetY).y);

         if (isX)
         {
           color = computeGrassTex(vec2(pos.x + uPlayerPos.x, pos.y-offsetY), nextPosZId)*(1.-color.a)*factor + color;
         }
         else
         {
           color = computeGrassTex(vec2(pos.z + uPlayerPos.z, pos.y-offsetY), nextPosXId)*(1.-color.a)*factor + color;
         }
         if (color.a>=1.)
         {
           break;
         }
      }
      else
      {
        break;
      }
    }
    return mix(groundColor, color.rgb + groundColor*(1.-color.a), factor);


  }


#endif

float uTreeUnitSize = 320.;
uniform vec3 uSunDir;
float uTreeLength = 250.;

float uTreeNbHalfUnit = 60.;
float uTreeNbUnit = uTreeNbHalfUnit*2.+1.;

uniform sampler2D uTreeHeightSampler;
float uTreeHeightSamplerSize = 128.;

uniform sampler2D uTreeTextureSampler;
float uNbRows = 8.;
float uNbCols = 8.;


vec4 getTreePos(float i, float j)
{
  vec2 uv = vec2(floor(uTreeNbHalfUnit+i+1.5),
                 floor(uTreeNbHalfUnit+j+1.5));

  vec4 tex = texture2D(uTreeHeightSampler, uv/uTreeHeightSamplerSize);
  return tex;
}

float computeTreeShadow()
{
  float shadow = 1.;

/*
  vec3 eyeToVertexDir = uEyePosInWorld-vVertexPosInWorld;
  eyeToVertexDir.y=0.;
  eyeToVertexDir = normalize(eyeToVertexDir);
*/
  vec3 e = vVertexPosInWorld;
  vec3 w = normalize(uSunDir);
  vec2 n = normalize(uSunDir.xz);
  vec2 t = vec2(-n.y, n.x);

  float costheta = dot(uSunDir, vec3(0., 1., 0.));
  float directionnalShadowFactor = 0.5+0.5*smoothstep(1., 0.8, costheta);
  float ambiantShadowFactor = smoothstep(0.5, 1., costheta);
  float occlusionLength = mix(uTreeLength/3., uTreeLength/1.3, ambiantShadowFactor);

  vec3 wodn = w/dot(n, w.xz);
  vec2 pInit = (e.xz+mod(uPlayerPos.xz, uTreeUnitSize))/uTreeUnitSize;

  float angleStep = 6.28/(uNbRows*uNbCols);
  float angle = atan2(t.y, t.x);

  for(int i=-1; i<=1; i++){
    for (int j=-1; j<=1; j++){

       vec4 p = getTreePos(float(i)+pInit.x, float(j)+pInit.y);

       vec3 diffuseFactors = computeDiffuseFactors(p.y);
       //p.y -= 10.;

       if (diffuseFactors.y>0.4)
       {
         if (dot(p.xyz-e.xyz, w)>0.)
         {
           vec3 x = e+wodn*dot(n, p.xz-e.xz);

           float u = (dot(x.xz-p.xz, t)/uTreeLength)*0.5+0.5;
           float v = (x.y-p.y)/(uTreeLength*2.);

           if (v>=0. && v<0.95 && u>=0. && u<0.95)
           {
             float angleI = angle + p.a;
             angleI = mod(angleI, 6.28);
             float id = angle/angleStep;
             float row = floor(mod(id, uNbRows));
             float col = floor(id/uNbRows);

             vec2 uv = (vec2(u, v)+vec2(row, col))/vec2(uNbRows, uNbCols);


             vec4 tex = texture2D(uTreeTextureSampler, uv);
             shadow = min(shadow, 1.-0.3*tex.a*tex.a*directionnalShadowFactor);

           }
         }
         shadow = min(shadow, 1.-0.3*smoothstep(occlusionLength, occlusionLength*0.5, length(p.xz-e.xz)));
       }
    }
  }

  return shadow;
}




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


  //Compute diffuse factors
  vec3 diffuseFactors = computeDiffuseFactors(vVertexPosInWorld.y-vDiffuseHeightOffset);

  //Compute diffuse normal factors
  float cosNormalAngle = dot(normal, vec3(0., 1., 0.));
  vec3 diffuseNormalFactors = computeDiffuseNormalFactors(cosNormalAngle);

  //Compute diffuse far factors
  vec3 diffuseFarFactors = computeDiffuseFarFactors(eyeToVertexDist);


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
    if (diffuseFactors.x>0.)
    {
      diffuseTex = texture2D(uDiffuse1Sampler, diffuse1Uv).rgb;
      #ifdef DIFFUSE_FAR_1
        diffuseTex = mix(diffuseTex, texture2D(uDiffuseFar1Sampler, diffuseFar1Uv).rgb, diffuseFarFactors.x);
      #endif
      #ifdef DIFFUSE_NORMAL_1
        diffuseTex = mix(diffuseTex, texture2D(uDiffuseNormal1Sampler, diffuseNormal1Uv).rgb, diffuseNormalFactors.x);
      #endif
      diffuseBaseColor = diffuseTex;
    }
    #ifdef DIFFUSE_2
      if (diffuseFactors.y>0.)
      {
        if (diffuseFactors.x>0.)
        {
          diffuseTex = texture2D(uDiffuse2Sampler, diffuse2Uv).rgb;
          #ifdef DIFFUSE_FAR_2
            diffuseTex = mix(diffuseTex, texture2D(uDiffuseFar2Sampler, diffuseFar2Uv).rgb, diffuseFarFactors.y);
          #endif
          #ifdef DIFFUSE_NORMAL_2
            diffuseTex = mix(diffuseTex, texture2D(uDiffuseNormal2Sampler, diffuseNormal2Uv).rgb, diffuseNormalFactors.y);
          #endif

          diffuseBaseColor = mix(diffuseBaseColor, diffuseTex , diffuseFactors.y);
        }
        else
        {
          diffuseTex = texture2D(uDiffuse2Sampler, diffuse2Uv).rgb;
          #ifdef DIFFUSE_FAR_2
            diffuseTex = mix(diffuseTex, texture2D(uDiffuseFar2Sampler, diffuseFar2Uv).rgb, diffuseFarFactors.y);
          #endif
          #ifdef DIFFUSE_NORMAL_2
            diffuseTex = mix(diffuseTex, texture2D(uDiffuseNormal2Sampler, diffuseNormal2Uv).rgb, diffuseNormalFactors.y);
          #endif
          diffuseBaseColor = diffuseTex;
        }
      }
      #ifdef DIFFUSE_3
        if (diffuseFactors.z>0.)
        {
          if (diffuseFactors.y>0.)
          {
            diffuseTex = texture2D(uDiffuse3Sampler, diffuse3Uv).rgb;
            #ifdef DIFFUSE_FAR_3
              diffuseTex = mix(diffuseTex, texture2D(uDiffuseFar3Sampler, diffuseFar3Uv).rgb, diffuseFarFactors.z);
            #endif
            #ifdef DIFFUSE_NORMAL_3
              diffuseTex = mix(diffuseTex, texture2D(uDiffuseNormal3Sampler, diffuseNormal3Uv).rgb, diffuseNormalFactors.z);
            #endif
            diffuseBaseColor = mix(diffuseBaseColor, diffuseTex, diffuseFactors.z);
          }
          else
          {
            diffuseTex = texture2D(uDiffuse3Sampler, diffuse3Uv).rgb;
            #ifdef DIFFUSE_FAR_3
              diffuseTex = mix(diffuseTex, texture2D(uDiffuseFar3Sampler, diffuseFar3Uv).rgb, diffuseFarFactors.z);
            #endif
            #ifdef DIFFUSE_NORMAL_3
              diffuseTex = mix(diffuseTex, texture2D(uDiffuseNormal3Sampler, diffuseNormal3Uv).rgb, diffuseNormalFactors.z);
            #endif
            diffuseBaseColor = diffuseTex;
          }
        }
      #endif
    #endif
  #endif

  #ifdef GRASS
    diffuseBaseColor = computeGrassColor(diffuseBaseColor, diffuseFactors.y*max((1.-diffuseFarFactors.y)*1.5, 0.));
  #endif

  diffuseColor *= computeTreeShadow();

  color.rgb = diffuseColor * diffuseBaseColor;

  //Compute the fog color
  #ifdef FOG
    color.rgb = mix(clamp(skyColor, 0., 1.), color.rgb, CalcFogFactor(eyeToVertexDist, uFogInfos));
  #endif

  gl_FragColor = color;
}
