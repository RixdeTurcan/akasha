uniform vec3 uSunDirection;
uniform vec3 uSunLight;
uniform vec3 uSunColor;

uniform float uEarthRadius;
uniform float uAtmosphereRadius;

uniform vec3 uBetaRayleigh;
uniform vec3 uBetaMie;
uniform vec3 uBetaAerosol;
uniform vec3 uBetaOutScat;
vec3 uBetaMoon = vec3(1.0, 1.2, 1.5);

uniform float uMieAerosolDistMax;
uniform float uMieAerosolScaleMax;
uniform float uMieExentricity;
uniform float uRayleighPolarization;
uniform float uAerosolFactor;
uniform float uOutScatFactor;
float uMoonExentricity = 0.98;

uniform float uCloudHeight;
uniform float uCloudVerticalDepth;
uniform float uDensity;

vec3 uEarthCenterPos = vec3(0., -uEarthRadius, 0.);
vec3 uRgbWaveLength = vec3(680., 550., 440.);


uniform sampler2D uCloudSampler;

#ifndef PI
  #define PI 3.14159265359
#endif

vec3 atmosphereIntersectionPoint(vec3 dir)
{
  float r = uEarthRadius + uAtmosphereRadius;

  float a = dot(dir, dir);
  float b = 2.*dot(dir, -uEarthCenterPos);
  float c = dot(-uEarthCenterPos, -uEarthCenterPos) -r*r;

  float d = sqrt(b*b-4.0*a*c);

  float x1 = (-b-d)/(2.*a);
  float x2 = (-b+d)/(2.*a);

  float alpha = max(x1, x2);

  return alpha*dir;
}

float phaseRayleigh(float cosTheta)
{
    return 3.*(1.+uRayleighPolarization+(1.-uRayleighPolarization)*cosTheta*cosTheta)/(16.*PI);
}

float phaseMie(float cosTheta, float exentricity)
{
    float g = exentricity;// - uMieAerosolScaleMax * (1.-max(min(uSunDirection.y, uMieAerosolDistMax), 0.)/uMieAerosolDistMax);
    float a = 1.-g;
    float b = a*a/(4.*PI);
    float c = 1.+g*g-2.*g*cosTheta;

    return b/pow(abs(c), 1.5);
}

float phaseMieCloud(float cosTheta)
{
    float g = 0.7;
    float a = 1.-g;
    float b = a*a/(4.*PI);
    float c = 1.+g*g-2.*g*cosTheta;

    return b/pow(abs(c), 1.5);
}


float phaseMieAerosol(float cosTheta, float cosGamma)
{
    float f1 = (1. - abs(cosGamma));
    float f2 = pow(f1, 16.)*8.*phaseMie(cosTheta, 0.82);
    return f2 * uAerosolFactor;
}

float phaseAerosol(float cosTheta, float cosGamma)
{
    float f1 = (1. - abs(cosGamma));
    float f2 = 1.+cosTheta;
    return pow(f1, 5.) * uAerosolFactor;
}

varying vec2 vUv;

uniform vec3 uDeltaPlayerPos;


void main(void) {

    vec3 eyeToPosDir = computeEyeToPosDir(vUv);

    //Intersection point of the line of view and the atmosphere
    vec3 viewDirFarPoint = atmosphereIntersectionPoint(eyeToPosDir);
    float distViewdir = length(viewDirFarPoint);

    //Intersection point of the sun direction and the atmosphere
    vec3 sunDirFarPoint = atmosphereIntersectionPoint(uSunDirection);
    float distSunDir = length(sunDirFarPoint);

    //Distance of the two far points
    float distSunView = length(viewDirFarPoint - sunDirFarPoint);

    //Angle between the view direction and the sun direction
    float cosTheta = dot(eyeToPosDir, uSunDirection);

    //Angle between the view direction and the vertical
    float cosGamma = dot(eyeToPosDir, vec3(0., 1., 0.));


    //Out scattering effect
    vec3 outScatAbsorbtion = uBetaOutScat * uOutScatFactor;

    //Rayleigh effect
    vec3 outScatRayleigh = exp(outScatAbsorbtion*(distSunView+distViewdir)*0.4);
    vec3 inScatFactor = uBetaRayleigh * phaseRayleigh(cosTheta) * outScatRayleigh;

    //Mie effect
    vec3 outScatMie = exp(outScatAbsorbtion*(distSunView+distViewdir)*3.);
    vec3 outScatMieAerosol = exp(outScatAbsorbtion*(distSunDir)*8.);
    inScatFactor += uBetaMie*phaseMie(cosTheta, uMieExentricity) * outScatMie
                  + uBetaAerosol*phaseMieAerosol(cosTheta, cosGamma) * outScatMieAerosol;


    //Aerosol effect
    vec3 outScatAerosol = exp(outScatAbsorbtion*(distSunDir)*8.);
    inScatFactor += uBetaAerosol*phaseAerosol(cosTheta, cosGamma) * outScatAerosol;

    //Moon effect
    inScatFactor += uBetaMoon*phaseMie(-cosTheta, uMoonExentricity) * 0.8;


    //Final sky color
    vec3 color = uSunLight * inScatFactor;





 //Cloud
    vec3 cloudPos = vec3(0., 0., 0.);
    cloudPos.y = uCloudHeight;
    cloudPos.xz = cloudPos.y * eyeToPosDir.xz / eyeToPosDir.y;
    cloudPos.xz += uDeltaPlayerPos.xz;

    vec3 eyeTocloudPosDir = normalize(cloudPos);
    vec2 uvCloud = computeUv(eyeTocloudPosDir);


    vec4 cloudData = texture2D(uCloudSampler, uvCloud);
    float cloudNormalizedDensity = cloudData.r;
    float cloudNormalizedDensityEye = cloudData.g;

    if (cloudNormalizedDensity>0.)
    {
      vec3 sunDir = uSunDirection;
      sunDir.y = max(sunDir.y, 0.001);
      float cloudHeightMax = uCloudVerticalDepth;
      float alpha = cloudHeightMax/sunDir.y;
      vec3 maxDist = sunDir*alpha;
      float maxDensity = length(maxDist);

      float cloudDensity = maxDensity * cloudNormalizedDensity;
      float phase = 0.8 + min(phaseMieCloud(cosTheta) / cloudNormalizedDensity, 2.);


      float densityFactor = uDensity;
      vec3 cloudColor = uSunColor * phase * (0.2 + 0.8*exp(-densityFactor * cloudDensity));

      float factor = smoothstep(0., 0.3, cloudNormalizedDensityEye) * smoothstep(0.0, 0.2, eyeToPosDir.y);

      color = mix(color, cloudColor, factor);


    }









    gl_FragColor = vec4(color, 1.);
}
/*
void main(void) {
    vec2 uv = vUv;


    vec3 uEyePosInWorld = vec3(0., 0., 0.);
    vec3 eyeToPosDir = vec3(0., 0., 0.);

    eyeToPosDir.y = uv.y*2.-1.;

    float beta = uv.x*2.*PI;
    float alpha = sqrt(1.-eyeToPosDir.y*eyeToPosDir.y);

    eyeToPosDir.x = alpha*cos(beta);
    eyeToPosDir.z = alpha*sin(beta);


    vec3 viewDirFarPoint = atmosphereIntersectionPoint(uEyePosInWorld, eyeToPosDir);
    float distViewdir = length(viewDirFarPoint-uEyePosInWorld);

    float cosTheta = dot(eyeToPosDir, uSunDirection);
    float cosGamma = dot(eyeToPosDir, vec3(0., 1., 0.));

    vec3 inScatFactor = mix(uBetaRayleigh*phaseRayleigh(cosTheta),
                            uBetaAerosol*phaseAerosol(cosTheta),
                            factorAerosol(cosGamma, cosTheta))
                      + uBetaMie*phaseMie(cosTheta);

    vec3 outScatAbsorbtion = uBetaOutScat * uOutScatFactor;

    #ifdef OUT_SCAT_NB_STEP

      vec3 outScatFactor = vec3(0., 0., 0.);
      float frac = 1./float(OUT_SCAT_NB_STEP);
      vec3 fracDist = (viewDirFarPoint-uEyePosInWorld)*frac*frac;
      float fracDistNorm = length(fracDist);

      vec3 scatterPoint = uEyePosInWorld;

      for(int i=0; i<OUT_SCAT_NB_STEP; i++)
      {
        float iF = float(i);
        vec3 sunDirFarPoint = atmosphereIntersectionPoint(scatterPoint, uSunDirection);

        float dist = fracDistNorm*iF + length(sunDirFarPoint-scatterPoint);

        outScatFactor += taylorExp(outScatAbsorbtion*dist);

        scatterPoint = uEyePosInWorld + fracDist * iF * iF ;
      }

      outScatFactor *= frac;

    #else

      vec3 sunDirFarPoint = atmosphereIntersectionPoint(uEyePosInWorld, uSunDirection);

      float dist = length(sunDirFarPoint-uEyePosInWorld);

      vec3 outScatFactor = taylorExp(outScatAbsorbtion*dist);

    #endif

    vec3 color = uSunLight * inScatFactor * outScatFactor;

    //Cloud
    vec3 cloudPos = vec3(0., 0., 0.);
    cloudPos.y = uCloudHeight;
    cloudPos.xz = cloudPos.y * eyeToPosDir.xz / eyeToPosDir.y;
    cloudPos.xz += uDeltaPlayerPos.xz;

    vec3 eyeTocloudPosDir = normalize(cloudPos);
    vec2 uvCloud = computeUv(eyeTocloudPosDir);


    vec4 cloudData = texture2D(uCloudSampler, uvCloud);
    float cloudNormalizedDensity = cloudData.r;
    float cloudNormalizedDensityEye = cloudData.g;

    if (cloudNormalizedDensity>0.)
    {
      vec3 sunDir = uSunDirection;
      sunDir.y = max(sunDir.y, 0.001);
      float cloudHeightMax = uCloudVerticalDepth;
      float alpha = cloudHeightMax/sunDir.y;
      vec3 maxDist = sunDir*alpha;
      float maxDensity = length(maxDist);

      float cloudDensity = maxDensity * cloudNormalizedDensity;
      float phase = 0.8 + min(phaseMieCloud(cosTheta) / cloudNormalizedDensity, 2.);


      float densityFactor = uDensity;
      vec3 cloudColor = uSunColor * phase * (0.2 + 0.8*exp(-densityFactor * cloudDensity));

      float factor = smoothstep(0., 0.3, cloudNormalizedDensityEye) * smoothstep(0.0, 0.2, eyeToPosDir.y);

      color = mix(color, cloudColor, factor);


    }

    gl_FragColor = vec4(color, 1.);

}
*/
