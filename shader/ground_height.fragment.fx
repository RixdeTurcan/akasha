uniform vec3 uMinPosLeft;
uniform vec3 uMinPosRight;
uniform vec3 uMaxPosLeft;
uniform vec3 uMaxPosRight;

uniform vec3 uEyePosInWorld;
uniform vec3 uPlayerPos;

float uShanonMargin = 0.5;
float meanHeight = 0.;

vec2 uIslandPos = vec2(9000., 9000.);
float uIslandRadius1 = 9000.;
float uIslandRadius2 = 12000.;
float uIslandSlope1 = 1000.;
float uIslandSlope2 = 1500.;
float uIslandHeight1 = 1.;
float uIslandHeight2 = 0.07;
float uIslandNoise1 = 0.4;
float uIslandNoise2 = 0.08;
float uIslandShapeNoise = 5000.;

#ifdef NOISE_TEXTURE
  uniform sampler2D uNoiseSampler;
#endif

#ifdef GRID_DATA
  uniform sampler2D uGridDataSampler;
#endif

float computeOctave(float amplitude, vec2 period, vec2 params, vec2 deltaPos)
{
    //Detect if the noise frequency is greater than the sampling frequency
    float factorX = smoothstep(uShanonMargin/(2.*period.x), uShanonMargin/period.x, deltaPos.x);
    float factorY = smoothstep(uShanonMargin/(2.*period.y), uShanonMargin/period.y, deltaPos.y);

    float p = 10.;

    #ifndef NOISE_TEXTURE
      return 0.;//(1.-factorX)*(1.-factorY)*amplitude*pnoise(period*params, vec2(1., 1.)*p);
    #endif
    #ifdef NOISE_TEXTURE
      return (1.-factorX)*(1.-factorY)*amplitude*(-1.+2.*texture2D(uNoiseSampler, period*params/p).r);
    #endif
}

float getNoise(vec3 pos, float delta)
{
  vec2 deltaPos = vec2(delta, delta);
  vec2 params = pos.xz + uPlayerPos.xz;

  float n1 = computeOctave(1., vec2(0.001, 0.001), params, deltaPos)
           + computeOctave(0.5, vec2(0.002, 0.002), params, deltaPos)
           + computeOctave(0.35, vec2(0.004, 0.004), params, deltaPos);

  return n1/(1.+0.5+0.35);
}

float getDiffuseNoise(vec3 pos, float delta)
{
  vec2 deltaPos = vec2(delta, delta);
  vec2 params = pos.xz + uPlayerPos.xz +4000.;

  float n1 = computeOctave(2., vec2(0.002, 0.002), params, deltaPos)
           + computeOctave(0.5, vec2(0.004, 0.004), params, deltaPos)
           + computeOctave(0.5, vec2(0.01, 0.01), params, deltaPos);

  return n1/(2.+0.5+0.5);
}

float getShapeNoise(vec3 pos, float delta)
{
  vec2 deltaPos = vec2(delta, delta);
  vec2 params = pos.xz + uPlayerPos.xz +4000.;

  float n1 = computeOctave(2., vec2(0.0002, 0.0002), params, deltaPos)
           + computeOctave(0.5, vec2(0.0004, 0.0004), params, deltaPos)
           + computeOctave(0.35, vec2(0.0008, 0.0008), params, deltaPos);

  return n1/(2.+0.5+0.35);
}

varying vec2 vUv;

void main(void)
{
    gl_FragColor = vec4(0., 0., 0., 1.);

    #ifdef GRID_DATA
        vec2 uv = 1.-vUv;

        float s = 10.;
        vec4 data = texture2D(uGridDataSampler, uv);

        if (data.a < 0.5)
        {
          return;
        }

        vec3 pos = (data.rgb*255. - 127.)/1.;

        float deltaPos = s * pow(2., max(pos.y-1.,0.));
        pos.xz *= deltaPos;


        float islandDist = length(pos.xz + uPlayerPos.xz - uIslandPos) + getShapeNoise(pos, deltaPos)*uIslandShapeNoise;

        float factor1 = smoothstep(uIslandRadius1+uIslandSlope1, uIslandRadius1-uIslandSlope1, islandDist);
        float factor2 = smoothstep(uIslandRadius2+uIslandSlope2, uIslandRadius2-uIslandSlope2, islandDist);

        float islandHeight = -1.+factor2*(1.+uIslandHeight2) + factor1*(uIslandHeight1-uIslandHeight2);

        float height = getNoise(pos, deltaPos) * (uIslandNoise1*factor1 + uIslandNoise2*factor2) + islandHeight;
        float diffuseHeight = getDiffuseNoise(pos, deltaPos);

        height = 0.;diffuseHeight = 0.01;
        gl_FragColor = vec4((height*800.), pos.xz, diffuseHeight*100.);


    #endif
}
