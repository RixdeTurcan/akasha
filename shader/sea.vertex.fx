attribute vec2 uv;
attribute vec2 uv2;

uniform mat4 uViewProjection;
uniform vec3 uEyePosInWorld;
uniform vec3 uDeltaFoamCenterPos;

varying vec3 vNormal;
varying vec3 vVertexPosInWorld;

uniform float uTangentScreenDist;

#ifdef BUMP
    varying vec2 vBumpUV;
    uniform mat4 uBumpMatrix;
    uniform float uWindWaveFactorLength;
#endif

uniform vec3 uMinPosLeft;
uniform vec3 uMinPosRight;
uniform vec3 uMaxPosLeft;
uniform vec3 uMaxPosRight;

#ifdef NOISE_DATA
    uniform sampler2D uNoiseDataSampler;
    uniform float uNoiseFactor;
    uniform float uDisplacementNoiseFactor;
#endif

#ifdef WAVE_DATA
    uniform sampler2D uWaveDataSampler;
    uniform float uWaveMaxHeight;
    uniform float uDisplacementWaveFactor;
#endif

#ifdef FOAM
    uniform sampler2D uFoamSampler;
    varying vec4 vFoamcolor;
    uniform float uFoamWidth;
    uniform float uFoamHeight;
    uniform float uFoamLength;

    #ifdef DIFFUSE
        varying vec2 vDiffuseUV;
        uniform mat4 uDiffuseMatrix;
        uniform vec2 uDiffuseInfos;
    #endif
#endif

vec3 computeVertexPos(vec2 coord)
{
    vec3 pos =  computeProjectedPos(coord,
                                    uMinPosLeft, uMinPosRight, uMaxPosLeft, uMaxPosRight,
                                    uEyePosInWorld, 0.);

    vec4 tex = vec4(0., 0., 0., 0.);
    float foamNoiseReduction = 1.;
    float noiseReduction = 1.;
    #ifdef WAVE_DATA
        tex = texture2D(uWaveDataSampler, coord);
        pos.y += uWaveMaxHeight*tex.r;
        pos.xz -= uDisplacementWaveFactor*(tex.gb*2.-1.);
        noiseReduction = 2.*(1.-tex.a);
    #endif

    #ifdef FOAM
        vec2 uv = (pos.xz+uDeltaFoamCenterPos.xz)/uFoamWidth;
        vec2 coord3 = 0.5*(1.-uv);
        tex = texture2D(uFoamSampler, coord3);
        pos.y += sqrt(abs(tex.r)) * uFoamHeight;
        foamNoiseReduction = (10.-tex.r)/10.;
    #endif

    #ifdef NOISE_DATA
        tex = texture2D(uNoiseDataSampler, coord);
        pos.y += uNoiseFactor*noiseReduction*foamNoiseReduction*tex.r;
        pos.xz -= uDisplacementNoiseFactor*noiseReduction*foamNoiseReduction*(tex.gb*2.-1.)*(tex.a*2.-0.5);
    #endif


    return pos;
}

#ifdef SHADOWS
#ifdef LIGHT0
uniform mat4 lightMatrix0;
varying vec4 vPositionFromLight0;
#endif
#ifdef LIGHT1
uniform mat4 lightMatrix1;
varying vec4 vPositionFromLight1;
#endif
#ifdef LIGHT2
uniform mat4 lightMatrix2;
varying vec4 vPositionFromLight2;
#endif
#ifdef LIGHT3
uniform mat4 lightMatrix3;
varying vec4 vPositionFromLight3;
#endif
#endif

void main(void) {

    vec3 pos = computeVertexPos(uv);

    vec2 uvX = vec2(uv.x+uTangentScreenDist, uv.y);
    vec3 posX = computeVertexPos(uvX);

    vec2 uvY = vec2(uv.x, uv.y+uTangentScreenDist);
    vec3 posY = computeVertexPos(uvY);

    vec3 normal = normalize(cross(pos-posX, posY-pos));


    gl_Position = uViewProjection*vec4(pos, 1.);

    vNormal = normalize(normal);
    vVertexPosInWorld = pos;

    #ifdef BUMP
        vBumpUV = vec2((uBumpMatrix * vec4(pos.xz/uWindWaveFactorLength, 1., 1.)).xy);
    #endif

    #ifdef FOAM
        vec2 coord = 0.5*(1.-(pos.xz+uDeltaFoamCenterPos.xz)/uFoamWidth);
        if (coord.x>=0. && coord.x<1. && coord.y>=0. && coord.y<1.)
        {
            vFoamcolor = texture2D(uFoamSampler, coord);
        }
        else
        {
            vFoamcolor = vec4(0., 0., 0., 0.);
        }
        #ifdef DIFFUSE
            vDiffuseUV = vec2((uDiffuseMatrix * vec4(pos.xz/uFoamLength, 1., 1.)).xy);
        #endif
    #endif

  // Shadows
  #ifdef SHADOWS
  #ifdef LIGHT0
  vPositionFromLight0 = lightMatrix0 * vec4(pos, 1.0);
  #endif
  #ifdef LIGHT1
  vPositionFromLight1 = lightMatrix1 * vec4(pos, 1.0);
  #endif
  #endif

}
