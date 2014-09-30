precision mediump float;

uniform vec3 uMinPosLeft;
uniform vec3 uMinPosRight;
uniform vec3 uMaxPosLeft;
uniform vec3 uMaxPosRight;

uniform vec3 uEyePosInWorld;
uniform vec3 uDeltaEyePosInWorld;

uniform float uTime;
uniform float uPeriod;
uniform float uNoiseFactor;
uniform float uNoiseFactorPow;
uniform float uDisplacementNoiseFactor;

uniform vec3 uOctave1Period;
uniform float uOctave1Amplitude;

uniform vec3 uOctave2Period;
uniform float uOctave2Amplitude;

uniform vec3 uOctave3Period;
uniform float uOctave3Amplitude;

uniform vec3 uOctave4Period;
uniform float uOctave4Amplitude;

uniform float uShanonMargin;

float uNoiseMaxAmplitude = uOctave1Amplitude + uOctave2Amplitude
                         + uOctave3Amplitude + uOctave4Amplitude;

float computeOctave(float amplitude, vec3 period, vec3 params, vec2 deltaPos)
{
    //Detect if the noise frequency is greater than the sampling frequency
    float factorX = smoothstep(uShanonMargin/(2.*period.x), uShanonMargin/period.x, deltaPos.x);
    float factorY = smoothstep(uShanonMargin/(2.*period.y), uShanonMargin/period.y, deltaPos.y);

    return (1.-factorX)*(1.-factorY)*amplitude*snoise(period*params);
}

float getNoise(vec3 pos, vec3 pos2)
{
  vec2 deltaPos = abs(pos.xz-pos2.xz);
  vec3 params = vec3(0.5*(pos.xz+pos2.xz) + uDeltaEyePosInWorld.xz, uTime);

  float period = uPeriod;
  params = mod(params, period);
  if (params.x >= 0.5*period)
  {
    params.x = period - params.x;
  }
  if (params.y >= 0.5*period)
  {
    params.y = period - params.y;
  }
  if (params.z >= 0.5*period)
  {
    params.z = period - params.z;
  }


  float n1 = computeOctave(uOctave1Amplitude, uOctave1Period, params, deltaPos)
           + computeOctave(uOctave2Amplitude, uOctave2Period, params, deltaPos)
           + computeOctave(uOctave3Amplitude, uOctave3Period, params, deltaPos)/*
           + computeOctave(uOctave4Amplitude, uOctave4Period, params, deltaPos)*/;

  return pow(abs(n1/uNoiseMaxAmplitude), uNoiseFactorPow);
}

void main(void)
{
    //Radius of the sample area (assuming after that it is a rectangle)
    vec2 area = vec2(0.5, 0.5);

    //Uv position of the lower left point of the area
    vec2 uv = (gl_FragCoord.xy-area)*INV_TEXTURE_SIZE;
    vec3 pos = computeProjectedPos(uv,
                                   uMinPosLeft, uMinPosRight, uMaxPosLeft, uMaxPosRight,
                                   uEyePosInWorld, 0.);

    //Uv position of the upper right point of the area
    vec2 uv2 = (gl_FragCoord.xy+area)*INV_TEXTURE_SIZE;
    vec3 pos2 = computeProjectedPos(uv2,
                                    uMinPosLeft, uMinPosRight, uMaxPosLeft, uMaxPosRight,
                                    uEyePosInWorld, 0.);

    float noise = getNoise(pos, pos2);

    gl_FragColor = vec4(noise, 0.0, 0.0, 1.0);
}
