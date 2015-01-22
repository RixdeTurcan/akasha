
float uShanonMargin = 0.5;

// radius1, radius2, radius3, centerPosX,
// slope1, slope2, slope3, centerPosY,
// height1, height2, height3, 0.
// noise1, noise2, noise3, 0.,
mat4 uIsland1Data1 = mat4(
    6100., 9000., 17000., 14000.,
    1500., 1000., 5000., 14000.,
    0.735, 0.265, 1.05, 0.,
    0.1, 0.2, 0.05, 0.
);

//noiseA1, noiseA2, noiseA3,  0.
//0., 0., 0., 0.
//shapeNoiseA1, shapeNoiseA2, shapeNoiseA3, shapeNoiseAg,
//ShapeNoisePeriodX, shapeNoisePeriodY, noisePeriodX, noisePeriodY
mat4 uIsland1Data2 = mat4(
    0.4, 0.25, 0.15, 0.,
    0., 0., 0., 0.,
    0.7, 0.2, 0.1, 8000.,
    0.0002, 0.0002, 0.001, 0.001
);

float uIslandDiffuseNoiseAmplitude = 150.;
vec3 uIslandDiffuseNoiseAmplitudes = vec3(0.6, 0.2, 0.2);
vec2 uIslandDiffuseNoisePeriod = vec2(0.002, 0.002);

float uMaxHeight = 1300.;


//Get height noise
float getNoise(vec2 pos, vec2 deltaPos, mat4 uIslandIData2)
{
  return computeOctaves(uIslandIData2[0].xyz, uIslandIData2[3].zw, pos, deltaPos, uShanonMargin);
}

//Get diffuse texture height limit
float getDiffuseNoise(vec2 pos, vec2 deltaPos)
{
  return computeOctaves(uIslandDiffuseNoiseAmplitudes, uIslandDiffuseNoisePeriod, pos, deltaPos, uShanonMargin);
}

//Get island distance noise
float getShapeNoise(vec2 pos, vec2 deltaPos, mat4 uIslandIData2)
{
  return computeOctaves(uIslandIData2[2].xyz, uIslandIData2[3].xy, pos, deltaPos, uShanonMargin);
}

float getHeightShiftIslandI(vec2 realPos, vec2 deltaPos, mat4 uIslandIData1, mat4 uIslandIData2)
{
   vec2 center = vec2(uIslandIData1[0].a, uIslandIData1[1].a);
   float islandDist = length(realPos - center);

   if (islandDist<uIslandIData1[0].z+uIslandIData1[1].z+uIslandIData2[2].a)
   {

     islandDist += getShapeNoise(realPos, deltaPos, uIslandIData2) * uIslandIData2[2].a;


     vec3 factor = vec3(smoothstep(uIslandIData1[0].x+uIslandIData1[1].x, uIslandIData1[0].x-uIslandIData1[1].x, islandDist),
                        smoothstep(uIslandIData1[0].y+uIslandIData1[1].y, uIslandIData1[0].y-uIslandIData1[1].y, islandDist),
                        smoothstep(uIslandIData1[0].z+uIslandIData1[1].z, uIslandIData1[0].z-uIslandIData1[1].z, islandDist));

     return dot(factor, uIslandIData1[2].xyz)
          + getNoise(realPos, deltaPos, uIslandIData2)
            * dot(uIslandIData1[3].xyz, factor);
   }
   else
   {
     return 0.;
   }
}

vec3 computeVertexPos(vec2 pos, vec2 deltaPos, vec2 playerPos)
{
   vec2 realPos = pos + playerPos;

   float height = -1.
                + getHeightShiftIslandI(realPos, deltaPos, uIsland1Data1, uIsland1Data2);

   return vec3(pos.x, uMaxHeight*height, pos.y);
}

float getDiffuseHeightOffset(vec2 pos, vec2 deltaPos)
{
  return getDiffuseNoise(pos, deltaPos)*uIslandDiffuseNoiseAmplitude;
}


#ifdef DIFFUSE_FAR_1
  float uDiffuseFar1Limit = -1.;
  float uDiffuseFar1Slope = 0.;
#endif

#ifdef DIFFUSE_FAR_2
  float uDiffuseFar2Limit = 2500.;
  float uDiffuseFar2Slope = 500.;
#endif

#ifdef DIFFUSE_FAR_3
  float uDiffuseFar3Limit = -1.;
  float uDiffuseFar3Slope = 0.;
#endif

#ifdef DIFFUSE_NORMAL_1
  float uDiffuseNormal1Limit = -1.;
  float uDiffuseNormal1Slope = 0.;
#endif

#ifdef DIFFUSE_NORMAL_2
  float uDiffuseNormal2Limit = 0.8;
  float uDiffuseNormal2Slope = 0.1;
#endif

#ifdef DIFFUSE_NORMAL_3
  float uDiffuseNormal3Limit = 0.85;
  float uDiffuseNormal3Slope = 0.1;
#endif

#ifdef DIFFUSE_2
  float uDiffuse1To2Height = 140.;
  float uDiffuse1To2Slope = 60.;
#endif

#ifdef DIFFUSE_3
  float uDiffuse2To3Height = 700.;
  float uDiffuse2To3Slope = 200.;
#endif


vec3 computeDiffuseFactors(float height)
{
  vec3 factors = vec3(0., 0., 0.);

  #ifdef DIFFUSE_1
    factors.x = 1.;

    #ifdef DIFFUSE_2
      factors.y = smoothstep(uDiffuse1To2Height-uDiffuse1To2Slope, uDiffuse1To2Height+uDiffuse1To2Slope, height);
      factors.x *= 1. - factors.y;

      #ifdef DIFFUSE_3
        factors.z = smoothstep(uDiffuse2To3Height-uDiffuse2To3Slope, uDiffuse2To3Height+uDiffuse2To3Slope, height);
        factors.y *= 1. - factors.z;

      #endif
    #endif
  #endif

  return factors;
}

vec3 computeDiffuseNormalFactors(float cosAngle)
{
  vec3 factors = vec3(0., 0., 0.);

  #ifdef DIFFUSE_NORMAL_1
    factors.x = smoothstep(uDiffuseNormal1Limit+uDiffuseNormal1Slope, uDiffuseNormal1Limit-uDiffuseNormal1Slope, cosAngle);
  #endif
  #ifdef DIFFUSE_NORMAL_2
    factors.y = smoothstep(uDiffuseNormal2Limit+uDiffuseNormal2Slope, uDiffuseNormal2Limit-uDiffuseNormal2Slope, cosAngle);
  #endif
  #ifdef DIFFUSE_NORMAL_3
    factors.z = smoothstep(uDiffuseNormal3Limit+uDiffuseNormal3Slope, uDiffuseNormal3Limit-uDiffuseNormal3Slope, cosAngle);
  #endif

  return factors;
}

vec3 computeDiffuseFarFactors(float dist)
{
  vec3 factors = vec3(0., 0., 0.);

  #ifdef DIFFUSE_FAR_1
    factors.x = smoothstep(uDiffuseFar1Limit-uDiffuseFar1Slope, uDiffuseFar1Limit+uDiffuseFar1Slope, dist);
  #endif
  #ifdef DIFFUSE_FAR_2
    factors.y = smoothstep(uDiffuseFar2Limit-uDiffuseFar2Slope, uDiffuseFar2Limit+uDiffuseFar2Slope, dist);
  #endif
  #ifdef DIFFUSE_FAR_3
    factors.z = smoothstep(uDiffuseFar3Limit-uDiffuseFar3Slope, uDiffuseFar3Limit+uDiffuseFar3Slope, dist);
  #endif

  return factors;
}
