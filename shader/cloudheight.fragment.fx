uniform vec2 uCloudPos;
uniform float uPeriod;
uniform float uCloudHeight;
uniform float uPresence;

float uShanonMargin = 1.0;

#ifndef PI
  #define PI 3.14159265359
#endif


#ifdef NOISE_TEXTURE
  uniform sampler2D uNoiseSampler;
#endif

varying vec2 vUv;


vec4 computeCloudPos(vec2 uv)
{
    vec3 eyeToPosDir = computeEyeToPosDir(uv);

    float dirY = eyeToPosDir.y;

    eyeToPosDir.y = max(abs(eyeToPosDir.y), 0.001);

    vec3 cloudPos = vec3(0., 0., 0.);
    cloudPos.y = uCloudHeight;
    cloudPos.xz = cloudPos.y * eyeToPosDir.xz / eyeToPosDir.y;

    return vec4(cloudPos, dirY);
}



float computeOctave(float amplitude, vec2 period, vec2 params, vec2 deltaPos)
{
    //Detect if the noise frequency is greater than the sampling frequency
    float factorX = smoothstep(uShanonMargin/(2.*period.x), uShanonMargin/period.x, deltaPos.x);
    float factorY = smoothstep(uShanonMargin/(2.*period.y), uShanonMargin/period.y, deltaPos.y);

    float factorPeriod = 10000.;
    #ifndef NOISE_TEXTURE
      return 0.;//(1.-factorX)*(1.-factorY)*amplitude*pnoise(period*params, vec2(1., 1.)*uPeriod/factorPeriod);
    #endif
    #ifdef NOISE_TEXTURE
      return (1.-factorX)*(1.-factorY)*amplitude*(-1.+2.*texture2D(uNoiseSampler, period*params*factorPeriod/uPeriod).r);
    #endif

}


float getBumpNoise(vec3 pos, vec3 pos2)
{
  vec2 deltaPos = abs(pos.xz-pos2.xz);
  vec2 params = 0.5*(pos.xz+pos2.xz) + uCloudPos;
  float n = 0.;
  float div = 0.;

   n += computeOctave(1.5, vec2(0.0003, 0.0003), params, deltaPos);
   div += 1.5;

   n += computeOctave(1.5, vec2(0.0006, 0.0006), params, deltaPos);
   div += 1.5;

   n += computeOctave(1.6, vec2(0.0012, 0.0012), params, deltaPos);
   div += 1.6;

   n += computeOctave(1.3, vec2(0.0024, 0.0024), params, deltaPos);
   div += 1.3;

   n += computeOctave(0.8, vec2(0.0048, 0.0048), params, deltaPos);
   div += 0.8;

   return n/div;
}

vec2 getNoise(vec3 pos, vec3 pos2)
{
  vec2 deltaPos = abs(pos.xz-pos2.xz);
  vec2 params = 0.5*(pos.xz+pos2.xz) + uCloudPos;

  float n = 0.;
  float div = 0.;

  #ifdef OCTAVE0
   n += computeOctave(0.5, vec2(0.0001, 0.0001), params, deltaPos);
   div += 0.5;
  #endif
  #ifdef OCTAVE1
   n += computeOctave(0.25, vec2(0.0002, 0.0002), params, deltaPos);
   div += 0.25;
  #endif
  #ifdef OCTAVE2
   n += computeOctave(0.125, vec2(0.0004, 0.0004), params, deltaPos);
   div += 0.125;
  #endif
  #ifdef OCTAVE3
   n += computeOctave(0.0625, vec2(0.0008, 0.0008), params, deltaPos);
   div += 0.0625;
  #endif
  #ifdef OCTAVE4
   n += computeOctave(0.03125, vec2(0.0016, 0.0016), params, deltaPos);
   div += 0.03125;
  #endif
  #ifdef OCTAVE5
   n += computeOctave(0.015625, vec2(0.0032, 0.0032), params, deltaPos);
   div += 0.015625;
  #endif
  #ifdef OCTAVE6
   n += computeOctave(0.0078125, vec2(0.0064, 0.0064), params, deltaPos);
   div += 0.0078125;
  #endif

  return vec2(n, div);
}

#ifdef SWAP_TEXTURE
  uniform sampler2D uSwapSampler;
#endif

void main(void) {

    vec4 cloudPos0 = computeCloudPos(vUv-INV_TEXTURE_SIZE);

    if (cloudPos0.a<0.001)
    {
      discard;
    }

    vec4 cloudPos1 = computeCloudPos(vUv+INV_TEXTURE_SIZE);


    vec2 data = getNoise(cloudPos0.xyz, cloudPos1.xyz);


    float bump = 0.;

    #ifdef SWAP_TEXTURE
      #ifndef RESET
        vec4 tex = texture2D(uSwapSampler, 1.-vUv);
        data.x += tex.r*2.-1.;
        data.y += tex.b;
      #endif
    #endif
    #ifdef END
      data.x = max(abs(data.x)*(1.0+uPresence)/data.y - uPresence, 0.);
      data.y = 0.;

      bump = getBumpNoise(cloudPos0.xyz, cloudPos1.xyz);

    #else
      data.x = (data.x+1.)*0.5;
    #endif

    gl_FragColor = vec4(data.x, bump, data.y, 1.);
}
