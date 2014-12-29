varying vec2 vUv;

uniform float uFoamWidth;

uniform vec3 uDeltaCenterPos;

#ifdef SWAP
  uniform sampler2D uSwapSampler;
#endif

#ifdef SHORE
  uniform sampler2D uFoamShoreSampler;
#endif

uniform float uTime;

uniform float uWave1CenterPosPhase;
uniform float uWave1TotalLength;
uniform float uWave1RisingLength;
uniform float uWave1Velocity;
uniform vec2  uWave1Dir;

uniform float uWave2CenterPosPhase;
uniform float uWave2TotalLength;
uniform float uWave2RisingLength;
uniform float uWave2Velocity;
uniform vec2  uWave2Dir;

uniform float uWave3CenterPosPhase;
uniform float uWave3TotalLength;
uniform float uWave3RisingLength;
uniform float uWave3Velocity;
uniform vec2  uWave3Dir;

float waveBreakingFactor(vec2 pos, float phaseLimit, vec2 shoreDir)
{
  float phase1 = (mod(dot(pos, uWave1Dir) + uWave1Velocity*uTime + uWave1CenterPosPhase, uWave1TotalLength) - uWave1RisingLength)/uWave1TotalLength;
  float phase2 = (mod(dot(pos, uWave2Dir) + uWave2Velocity*uTime + uWave2CenterPosPhase, uWave2TotalLength) - uWave2RisingLength)/uWave2TotalLength;
  float phase3 = (mod(dot(pos, uWave3Dir) + uWave3Velocity*uTime + uWave3CenterPosPhase, uWave3TotalLength) - uWave3RisingLength)/uWave3TotalLength;

  if (phase1<phaseLimit && phase1>0. && dot(shoreDir, uWave1Dir)>0.)
  {
    return dot(shoreDir, uWave1Dir);
  }
  else if (phase2<phaseLimit && phase2>0. && dot(shoreDir, uWave2Dir)>0.)
  {
    return 1.;
  }
  else if (phase3<phaseLimit && phase3>0. && dot(shoreDir, uWave3Dir)>0.)
  {
    return 1.;
  }

  return 0.;
}



uniform float uDispertion;
uniform float uVelAbs;
uniform float uViscosity;
uniform float uSourceAdd;
uniform float uWaveBreakingAngle;


void main(void)
{
  gl_FragColor = vec4(0., 0., 0., 1.);

#ifdef SWAP
#ifdef SHORE

  float foam = 0.;
  vec2 dir = vec2(0., 0.);
  float isSource = 0.;

  vec2 pos = (vUv*2.-1.)*uFoamWidth;

  vec2 previousUv = vUv + (uDeltaCenterPos.xz)/(2.*uFoamWidth);

  vec4 shoreData = texture2D(uFoamShoreSampler, vUv);
  float shoreHeight = shoreData.r;
  vec2 shoreNormal = shoreData.gb *2. -1.;

  float wf = waveBreakingFactor(pos, uWaveBreakingAngle, shoreNormal);

  if (wf>0.5 && shoreHeight > 0.01 && shoreHeight < 0.99)
  {
    foam = (0.1+0.9*length(shoreNormal))*uSourceAdd;
    dir = shoreNormal;
    isSource = 1.;
  }


  float step = INV_TEXTURE_SIZE;
  vec2 uv11 = 1.-previousUv;
  vec2 uv01 = vec2(uv11.x-step, uv11.y);
  vec2 uv21 = vec2(uv11.x+step, uv11.y);
  vec2 uv10 = vec2(uv11.x, uv11.y-step);
  vec2 uv12 = vec2(uv11.x, uv11.y+step);

  float f = 1.-uViscosity;

  vec4 tex11 = texture2D(uSwapSampler, uv11);
  vec4 tex01 = texture2D(uSwapSampler, uv01);
  vec4 tex21 = texture2D(uSwapSampler, uv21);
  vec4 tex10 = texture2D(uSwapSampler, uv10);
  vec4 tex12 = texture2D(uSwapSampler, uv12);

  float p01 = f*uDispertion*tex01.r*(-tex01.g+1.)/4.;
  float p21 = f*uDispertion*tex21.r*(tex21.g+1.)/4.;
  float p10 = f*uDispertion*tex10.r*(-tex10.b+1.)/4.;
  float p12 = f*uDispertion*tex12.r*(tex12.b+1.)/4.;
  float p11 = uViscosity*uDispertion*tex11.r;

  foam = min(foam +p11 + p01 + p21 + p10 + p12, 10.);
  dir = mix((tex01.gb + tex11.gb + tex21.gb + tex10.gb + tex12.gb)/(5.+uVelAbs), dir, isSource);

  gl_FragColor = vec4(foam, dir, 1.);

#endif
#endif
}
