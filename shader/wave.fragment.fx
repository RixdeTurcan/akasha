uniform vec3 uMinPosLeft;
uniform vec3 uMinPosRight;
uniform vec3 uMaxPosLeft;
uniform vec3 uMaxPosRight;

uniform vec3 uEyePosInWorld;

#ifndef PI
  #define PI 3.14159265359
#endif

uniform float uWaveMaxHeight;

uniform float uTime;

uniform float uWave1Amplitude;
uniform float uWave1Length;
uniform float uWave1TotalLength;
uniform float uWave1RisingLength;
uniform float uWave1Velocity;
uniform vec2  uWave1Dir;
uniform float uWave1EyePosPhase;

uniform float uWave2Amplitude;
uniform float uWave2Length;
uniform float uWave2TotalLength;
uniform float uWave2RisingLength;
uniform float uWave2Velocity;
uniform vec2  uWave2Dir;
uniform float uWave2EyePosPhase;

uniform float uWave3Amplitude;
uniform float uWave3Length;
uniform float uWave3TotalLength;
uniform float uWave3RisingLength;
uniform float uWave3Velocity;
uniform vec2  uWave3Dir;
uniform float uWave3EyePosPhase;

float uNbWaves = 3.;
float uInvNbWaves = 1./uNbWaves;

uniform float uShanonMargin;

vec2 waveIHeight(vec2 pos1, vec2 pos2, float eyePosPhase, vec2 dir, float vel, float risingLength, float waveLength, float totalLength, float amplitude)
{
    float phase1 = dot(pos1, dir) + vel*uTime;
    float phase2 = dot(pos2, dir) + vel*uTime;

    //current sampling length of the wave
    float dPhase = abs(phase1-phase2);

    //Wave minimum period (maximum frequency)
    float minT = min(risingLength, waveLength-risingLength);

    //Mean of the wave
    float meanAmplitudeFactor = 0.;
    float meanAmplitude = amplitude * 0.5;

    //factor1: sampling in [risingLenght, waveLength]
    //factor2: sampling in [waveLength, totalLength]
    float factor1 = smoothstep(uShanonMargin*minT, uShanonMargin*0.5*waveLength, dPhase);
    float factor2 = smoothstep(uShanonMargin*0.5*waveLength, uShanonMargin*0.5*totalLength, dPhase);

    //Reduce the high frequencies when the sampling is not sufficient
    waveLength += (totalLength-waveLength) * factor2;
    risingLength += (0.5*waveLength-risingLength) * factor1;
    meanAmplitudeFactor = 0.5*(factor1+factor2);
    amplitude *= 1.-meanAmplitudeFactor;

    float phase = mod(0.5*(phase1+phase2) + eyePosPhase, totalLength);

    //Factor3: phase < or > to risingLength
    //Factor4: phase < or > to waveLength
    float factor3 = step(risingLength, phase);
    float factor4 = step(waveLength, phase);

    //Compute the wave height
    float height = (1.-factor3)*(1.-factor4)*amplitude*0.5*(1.-cos(phase*PI/risingLength))
                 + factor3*(1.-factor4)*amplitude*0.5*(1.+cos((phase-risingLength)*PI/(waveLength-risingLength)))
                 + meanAmplitudeFactor*meanAmplitude;

    return vec2(height, meanAmplitudeFactor);
}

vec3 waveINormal(vec2 pos, float eyePosPhase, vec2 dir, float vel, float risingLength, float waveLength, float totalLength, float amplitude)
{
    float phase = mod(dot(pos, dir) + eyePosPhase + vel*uTime, totalLength);
    vec3 normal = vec3(0.0, 1.0, 0.0);

    //Factor1: phase < or > to risingLength
    //Factor2: phase < or > to waveLength
    float factor1 = step(risingLength, phase);
    float factor2 = step(waveLength, phase);

    //Compute the wave normal
    normal.xz = (1.-factor1)*(1.-factor2)*(-dir*(amplitude*PI/(2.*risingLength))*sin(phase*PI/risingLength))
              + factor1*(1.-factor2)*(dir*(amplitude*PI/(2.*(waveLength-risingLength))*sin((phase-risingLength)*PI/(waveLength-risingLength))));

    return normal;
}

vec2 waveHeight(vec2 pos1, vec2 pos2)
{
    return waveIHeight(pos1, pos2, uWave1EyePosPhase, uWave1Dir, uWave1Velocity, uWave1RisingLength, uWave1Length, uWave1TotalLength, uWave1Amplitude)
         + waveIHeight(pos1, pos2, uWave2EyePosPhase, uWave2Dir, uWave2Velocity, uWave2RisingLength, uWave2Length, uWave2TotalLength, uWave2Amplitude)
         + waveIHeight(pos1, pos2, uWave3EyePosPhase, uWave3Dir, uWave3Velocity, uWave3RisingLength, uWave3Length, uWave3TotalLength, uWave3Amplitude);
}

vec3 waveNormal(vec2 pos)
{
    return waveINormal(pos, uWave1EyePosPhase, uWave1Dir, uWave1Velocity, uWave1RisingLength, uWave1Length, uWave1TotalLength, uWave1Amplitude)
         + waveINormal(pos, uWave2EyePosPhase, uWave2Dir, uWave2Velocity, uWave2RisingLength, uWave2Length, uWave2TotalLength, uWave2Amplitude)
         + waveINormal(pos, uWave3EyePosPhase, uWave3Dir, uWave3Velocity, uWave3RisingLength, uWave3Length, uWave3TotalLength, uWave3Amplitude);
}

uniform float uDisplacementWaveMinHeight;
uniform float uDisplacementWaveMaxHeight;
uniform float uNoiseReductionMinHeight;
uniform float uNoiseReductionFactor;

void main(void) {
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

    //Get the sum of the wave height and quantity of frequency reduction
    vec2 dataHeight = waveHeight(pos.xz, pos2.xz);

    pos.y = dataHeight.x;

    //Normalize the height in order to store it in a texture
    float normHeight = pos.y/uWaveMaxHeight;

    vec3 normal = normalize(waveNormal(pos.xz));

    //Compute the displacement in order to have more trochoidy wave
    //0.33 = 1/3. the total number of the waves
    float displacement = uInvNbWaves*(1.-dataHeight.y)*min(min(normHeight/uDisplacementWaveMinHeight, 1.0)*(1.-normHeight/uDisplacementWaveMaxHeight), 1.0);

    //Compute the noise reduction
    float noiseReduction = 1.-clamp((normHeight-uNoiseReductionMinHeight)/uNoiseReductionFactor, 0.0, 1.0);

    gl_FragColor = vec4(normHeight, 0.5*(1.+displacement*normal.xz), 1.0-0.5*noiseReduction);
  }
