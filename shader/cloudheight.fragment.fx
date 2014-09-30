uniform vec2 uCloudPos;
uniform float uPeriod;
uniform float uCloudHeight;
uniform float uPresence;

float uShanonMargin = 0.5;

#ifndef PI
  #define PI 3.14159265359
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

    return (1.-factorX)*(1.-factorY)*amplitude*pnoise(period*params, vec2(1., 1.)*uPeriod/factorPeriod);
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

vec2 pack(float a)
{
  vec2 b = vec2(0., 0.);
  float step = 255.;

  b.x = floor(a*step)/step;
  b.y = (a-b.x)*step;

  return b;
}

float unpack(vec2 a)
{

  float step = 255.;
  float b = a.x + a.y / step;

  return b;
}

void main(void) {

    vec4 cloudPos0 = computeCloudPos(vUv-INV_TEXTURE_SIZE);

    if (cloudPos0.a<0.001)
    {
      discard;
    }

    vec4 cloudPos1 = computeCloudPos(vUv+INV_TEXTURE_SIZE);


    vec2 data = getNoise(cloudPos0.xyz, cloudPos1.xyz);



    #ifdef SWAP_TEXTURE
      #ifndef RESET
        vec4 tex = texture2D(uSwapSampler, 1.-vUv);
        data.x += unpack(tex.rg)*2.-1.;
        data.y += tex.b;
      #endif
    #endif
    #ifdef END
      data.x = max(abs(data.x)*(1.0+uPresence)/data.y - uPresence, 0.);
      data.y = 0.;
    #else
      data.x = (data.x+1.)*0.5;
    #endif

    gl_FragColor = vec4(pack(data.x), data.y, 1.);
}
