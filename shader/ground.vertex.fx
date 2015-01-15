precision mediump float;

attribute vec3 position;

uniform mat4 uViewProjection;
uniform vec3 uPlayerPos;

varying vec3 vNormal;
varying vec3 vVertexPosInWorld;
varying float vDiffuseHeightOffset;

float uShanonMargin = 0.5;

// radius1, radius2, radius3, centerPosX,
// slope1, slope2, slope3, centerPosY,
// height1, height2, height3, 0.
// noise1, noise2, noise3, 0.,
mat4 uIsland1Data1 = mat4(
    6100., 9000., 14000., 13000.,
    2000., 1000., 2500., 13000.,
    0.735, 0.265, 1.035, 0.,
    0.1, 0.2, 0.1, 0.
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
float uDeltaPosDeltaFloorPackFactor = 1000.;


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

   if (islandDist<uIslandIData1[0].z+uIslandIData2[2].a)
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

vec3 computeVertexPos(vec2 pos, vec2 deltaPos)
{
   vec2 realPos = pos + uPlayerPos.xz;

   float height = -1.
                + getHeightShiftIslandI(realPos, deltaPos, uIsland1Data1, uIsland1Data2);

   return vec3(pos.x, uMaxHeight*height, pos.y);
}




void main(void)
{
  //smoothed distance between samples
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
