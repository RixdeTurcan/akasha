precision mediump float;

attribute vec3 position;

uniform mat4 uViewProjection;
uniform vec3 uPlayerPos;

varying vec3 vNormal;
varying vec3 vVertexPosInWorld;
varying float vDiffuseHeightOffset;


float uShanonMargin = 0.5;
vec2 uIslandPos = vec2(9000., 9000.);
float uIslandRadius0 = 7100.;
float uIslandRadius1 = 9000.;
float uIslandRadius2 = 14000.;
float uIslandSlope0 = 1000.;
float uIslandSlope1 = 1000.;
float uIslandSlope2 = 2500.;
float uIslandHeight0 = 1.;
float uIslandHeight1 = 0.3;
float uIslandHeight2 = 0.035;
float uIslandNoise0 = 0.4;
float uIslandNoise1 = 0.3;
float uIslandNoise2 = 0.1;

float uIslandShapeNoiseAmplitude = 8000.;
float uIslandDiffuseNoiseAmplitude = 150.;

vec3 uIslandNoiseAmplitudes1 = vec3(0.4, 0.25, 0.15);
vec3 uIslandNoiseAmplitudes2 = vec3(0.1, 0.05, 0.05);
vec2 uIslandNoisePeriod = vec2(0.001, 0.001);
vec3 uIslandDiffuseNoiseAmplitudes = vec3(0.6, 0.2, 0.2);
vec2 uIslandDiffuseNoisePeriod = vec2(0.002, 0.002);
vec3 uIslandShapeNoiseAmplitudes = vec3(0.7, 0.2, 0.1);
vec2 uIslandShapeNoisePeriod = vec2(0.0002, 0.0002);

float uMaxHeight = 1300.;

float uDeltaPosDeltaFloorPackFactor = 1000.;


//Get height noise
float getNoise(vec2 pos, vec2 deltaPos)
{
  return computeOctaves(uIslandNoiseAmplitudes1, uIslandNoisePeriod, pos, deltaPos, uShanonMargin)
       + computeOctaves(uIslandNoiseAmplitudes2, uIslandNoisePeriod*8., pos, deltaPos, uShanonMargin);
}

//Get diffuse texture height limit
float getDiffuseNoise(vec2 pos, vec2 deltaPos)
{
  return computeOctaves(uIslandDiffuseNoiseAmplitudes, uIslandDiffuseNoisePeriod, pos, deltaPos, uShanonMargin);
}

//Get island distance noise
float getShapeNoise(vec2 pos, vec2 deltaPos)
{
  return computeOctaves(uIslandShapeNoiseAmplitudes, uIslandShapeNoisePeriod, pos, deltaPos, uShanonMargin);
}





vec3 computeVertexPos(vec2 pos, vec2 deltaPos)
{
   vec2 realPos = pos + uPlayerPos.xz;

   //Distance to the center of the island
   float islandDist = length(realPos - uIslandPos)
                    + getShapeNoise(realPos, deltaPos) * uIslandShapeNoiseAmplitude;

   //factor related to the distance of each inner radius
   float factor0 = smoothstep(uIslandRadius0+uIslandSlope0, uIslandRadius0-uIslandSlope0, islandDist);
   float factor1 = smoothstep(uIslandRadius1+uIslandSlope1, uIslandRadius1-uIslandSlope1, islandDist);
   float factor2 = smoothstep(uIslandRadius2+uIslandSlope2, uIslandRadius2-uIslandSlope2, islandDist);

   //Island mean height
   float islandHeight = -1.
                      + factor2*(1.+uIslandHeight2)
                      + factor1*(uIslandHeight1-uIslandHeight2)
                      + factor0*(uIslandHeight0-uIslandHeight1-uIslandHeight2);

   //Island noised height
   float height = getNoise(realPos, deltaPos) * ( uIslandNoise2*factor2
                                                + (uIslandNoise1-uIslandNoise2)*factor1
                                                + (uIslandNoise0-uIslandNoise1-uIslandNoise2)*factor0)
                + islandHeight;

   return vec3(pos.x, uMaxHeight*height, pos.y);
}




void main(void)
{
  //smoothed distance betwwen samples
  float deltaPos = floor(position.y);
  vec2 deltaPosVec = vec2(1., 1.)*deltaPos;

  //Real distance between samples
  float DeltaFloor = (position.y - deltaPos)*uDeltaPosDeltaFloorPackFactor;

  //Floor the grid to have constant vextex position
  vec3 deltaPlayerPos = mod(uPlayerPos, DeltaFloor);
  vec2 vertexPos = position.xz-deltaPlayerPos.xz;

  //Compute the height of the vertex
  vec3 pos = computeVertexPos(vertexPos, deltaPosVec);

  //Compute the normal of the vertex
  vec3 posX = computeVertexPos(vertexPos+vec2(deltaPos, 0.), deltaPosVec);
  vec3 posY = computeVertexPos(vertexPos+vec2(0., deltaPos), deltaPosVec);
  vec3 normal = normalize(cross(pos-posX, posY-pos));

  //Fill some varying
  vNormal = normalize(normal);
  vVertexPosInWorld = pos;
  vDiffuseHeightOffset = getDiffuseNoise(pos.xz+uPlayerPos.xz, deltaPosVec)*uIslandDiffuseNoiseAmplitude;

  //Compute the screen position
  gl_Position = uViewProjection * vec4(pos, 1.);
}
