precision mediump float;

attribute vec3 position;

uniform mat4 uViewProjection;

uniform float uTangentScreenDist;

varying vec3 vNormal;
varying vec3 vVertexPosInWorld;
varying vec2 vUv;
varying float vDiffuseHeightOffset;

#ifdef CLIPPLANE
  uniform vec4 uClipPlane;
  varying float vClipDistance;
#endif

#ifdef NOISE_TEXTURE
  uniform sampler2D uNoiseSampler;
#endif

float uShanonMargin = 0.5;
float meanHeight = 0.;

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
float uIslandNoise0 = 0.4-0.3;
float uIslandNoise1 = 0.3-0.1;
float uIslandNoise2 = 0.1;
float uIslandShapeNoise = 8000.;

uniform vec3 uPlayerPos;

float computeOctave(float amplitude, vec2 period, vec2 param, float factor)
{
  vec4 tex = texture2D(uNoiseSampler, period*param/10.)*2.-1.;
  return factor*amplitude*tex.r;
}

float computeOctaves(vec3 amplitudes, vec2 period, vec2 param, vec2 deltaPos)
{
  float factorX1 = smoothstep(uShanonMargin/(2.*period.x), uShanonMargin/(1.*period.x), deltaPos.x);
  float factorX2 = smoothstep(uShanonMargin/(4.*period.x), uShanonMargin/(2.*period.x), deltaPos.x);
  float factorX3 = smoothstep(uShanonMargin/(8.*period.x), uShanonMargin/(4.*period.x), deltaPos.x);

  float factorY1 = smoothstep(uShanonMargin/(2.*period.y), uShanonMargin/(1.*period.y), deltaPos.y);
  float factorY2 = smoothstep(uShanonMargin/(4.*period.y), uShanonMargin/(2.*period.y), deltaPos.y);
  float factorY3 = smoothstep(uShanonMargin/(8.*period.y), uShanonMargin/(4.*period.y), deltaPos.y);

/*
  return computeOctave(amplitudes.x, period   , param, (1.-factorX1)*(1.-factorY1))
       + computeOctave(amplitudes.y, period*2., param, (1.-factorX2)*(1.-factorY2))
       + computeOctave(amplitudes.z, period*4., param, (1.-factorX3)*(1.-factorY3)) ;
*/
  vec4 tex = texture2D(uNoiseSampler, period*param/10.)*2.-1.;

  return (1.-factorX1)*(1.-factorY1)*amplitudes.x*tex.r
       + (1.-factorX2)*(1.-factorY2)*amplitudes.y*tex.g
       + (1.-factorX3)*(1.-factorY3)*amplitudes.z*tex.b;

}

float getNoise(vec3 pos, float delta)
{
  vec2 deltaPos = vec2(delta, delta);
  vec2 params = pos.xz + uPlayerPos.xz;

  float n1 = computeOctaves(vec3(0.4, 0.25, 0.15), vec2(0.001, 0.001), params, deltaPos)
           + computeOctaves(vec3(0.1, 0.05, 0.05), vec2(0.008, 0.008), params, deltaPos);

  return n1;
}


float getDiffuseNoise(vec3 pos, float delta)
{
  vec2 deltaPos = vec2(delta, delta);
  vec2 params = pos.xz + uPlayerPos.xz;

  float n1 = computeOctaves(vec3(0.6, 0.2, 0.2), vec2(0.002, 0.002), params, deltaPos);

  return n1;
}

float getShapeNoise(vec3 pos, float delta)
{
  vec2 deltaPos = vec2(delta, delta);
  vec2 params = pos.xz + uPlayerPos.xz;

  float n1 = computeOctaves(vec3(0.7, 0.2, 0.1), vec2(0.0002, 0.0002), params, deltaPos);

  return n1;
}








vec3 computeVertexPos(vec3 pos)
{
   float deltaPos = floor(pos.y);


   float islandDist = length(pos.xz + uPlayerPos.xz - uIslandPos) + getShapeNoise(pos, deltaPos)*uIslandShapeNoise;

   float factor0 = smoothstep(uIslandRadius0+uIslandSlope0, uIslandRadius0-uIslandSlope0, islandDist);
   float factor1 = smoothstep(uIslandRadius1+uIslandSlope1, uIslandRadius1-uIslandSlope1, islandDist);
   float factor2 = smoothstep(uIslandRadius2+uIslandSlope2, uIslandRadius2-uIslandSlope2, islandDist);

   float islandHeight = -1.+factor2*(1.+uIslandHeight2) + factor1*(uIslandHeight1-uIslandHeight2) + factor0*(uIslandHeight0-uIslandHeight1-uIslandHeight2);

   float height = getNoise(pos, deltaPos)* (uIslandNoise1*factor1 + uIslandNoise2*factor2 + uIslandNoise0*factor0) + islandHeight;

   return vec3(pos.x, 1300.*height, pos.z);
}




void main(void)
{
  float height = 0.;
  float deltaPos = floor(position.y);
  float DeltaFloor = (position.y - deltaPos)*1000.;

  vec3 deltaPlayerPos = mod(uPlayerPos, DeltaFloor);

  vec3 pos = computeVertexPos(position-deltaPlayerPos);


  vec3 posX = computeVertexPos(position+vec3(deltaPos, 0., 0.)-deltaPlayerPos);

  vec3 posY = computeVertexPos(position+vec3(0, 0., deltaPos)-deltaPlayerPos);


  vec3 normal = normalize(cross(pos-posX, posY-pos));

  vNormal = normalize(normal);
  vVertexPosInWorld = pos;

  vUv = vec2(0., 0.);//uv;
  vDiffuseHeightOffset = getDiffuseNoise(pos, deltaPos)*150.;


  #ifdef CLIPPLANE
    vClipDistance = dot(vec4(pos, 1.), uClipPlane);
  #endif



  gl_Position = uViewProjection * vec4(pos, 1.);
}
