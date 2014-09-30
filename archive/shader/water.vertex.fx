#ifdef GL_ES
precision mediump float;
#endif

// Attributes
attribute vec3 position;
attribute vec3 normal;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec3 color;
#endif
#ifdef BONES
attribute vec4 matricesIndices;
attribute vec4 matricesWeights;
#endif

// Uniforms
uniform mat4 world;
uniform mat4 view;
uniform mat4 viewProjection;

#ifdef DIFFUSE
varying vec2 vDiffuseUV;
uniform mat4 diffuseMatrix;
uniform vec2 vDiffuseInfos;
#endif

#ifdef AMBIENT
varying vec2 vAmbientUV;
uniform mat4 ambientMatrix;
uniform vec2 vAmbientInfos;
#endif

#ifdef OPACITY
varying vec2 vOpacityUV;
uniform mat4 opacityMatrix;
uniform vec2 vOpacityInfos;
#endif

#ifdef EMISSIVE
varying vec2 vEmissiveUV;
uniform vec2 vEmissiveInfos;
uniform mat4 emissiveMatrix;
#endif

#ifdef SPECULAR
varying vec2 vSpecularUV;
uniform vec2 vSpecularInfos;
uniform mat4 specularMatrix;
#endif

#ifdef BUMP
varying vec2 vBumpUV;
uniform vec2 vBumpInfos;
uniform mat4 bumpMatrix;
#endif

#ifdef FOAM_TEXTURE
varying vec2 vFoamUV;
uniform vec2 vFoamInfos;
uniform mat4 foamMatrix;
#endif


#ifdef BONES
uniform mat4 mBones[BonesPerMesh];
#endif

// Output
varying vec3 vPositionW;
varying vec3 vNormalW;

#ifdef VERTEXCOLOR
varying vec3 vColor;
#endif

#ifdef CLIPPLANE
uniform vec4 vClipPlane;
varying float fClipDistance;
#endif

#ifdef FOG
varying float fFogDistance;
#endif

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

#ifdef REFLECTION
varying vec3 vPositionUVW;
#endif


#define PI 3.14159



#ifdef FOAM_NOISE
uniform sampler2D foamAndNoiseSampler;
#endif



uniform float windWaveFactorLength;

varying vec2 vUv;
varying vec3 vNormal;
varying float vDistToCamera;

uniform float time;

uniform vec2 dataWave1Direction;
uniform float dataWave1Amplitude;
uniform float dataWave1Velocity;
uniform float dataWave1Length;

uniform vec2 dataWave2Direction;
uniform float dataWave2Amplitude;
uniform float dataWave2Velocity;
uniform float dataWave2Length;

uniform vec2 dataWave3Direction;
uniform float dataWave3Amplitude;
uniform float dataWave3Velocity;
uniform float dataWave3Length;

uniform float segmentLength;

uniform mat2 rot1;
uniform mat2 rotT1;
uniform mat2 rot2;
uniform mat2 rotT2;
uniform mat2 rot3;
uniform mat2 rotT3;

uniform float seaWidth;

float halfSeaWidth = seaWidth*0.5;
float invSeaWidth = 1./seaWidth;

#ifdef FOAM_NOISE
varying float vFoam;
#endif

vec3 wavePos1(vec3 coord)
{
    float centerPosX = dataWave1Direction.x*coord.x-dataWave1Direction.y*coord.z;
    vec3 wavePos = vec3(dataWave1Amplitude * sin(dataWave1Length*centerPosX-dataWave1Velocity*time),
                        - dataWave1Amplitude * (cos(dataWave1Length*centerPosX-dataWave1Velocity*time) - 1.0),
                        0.);
    wavePos.xz = rotT1 * wavePos.xz;
    return wavePos;
}

vec3 wavePos2(vec3 coord)
{
    float centerPosX = dataWave3Direction.x*coord.x-dataWave3Direction.y*coord.z;
    vec3 wavePos = vec3(dataWave2Amplitude * sin(dataWave2Length*centerPosX-dataWave2Velocity*time),
                        - dataWave2Amplitude * (cos(dataWave2Length*centerPosX-dataWave2Velocity*time) - 1.0),
                        0.);
    wavePos.xz = rotT2 * wavePos.xz;
    return wavePos;
}

vec3 wavePos3(vec3 coord)
{
    float centerPosX = dataWave3Direction.x*coord.x-dataWave3Direction.y*coord.z;
    vec3 wavePos = vec3(dataWave3Amplitude * sin(dataWave3Length*centerPosX-dataWave3Velocity*time),
                        - dataWave3Amplitude * (cos(dataWave3Length*centerPosX-dataWave3Velocity*time) - 1.0),
                        0.);
    wavePos.xz = rotT3 * wavePos.xz;
    return wavePos;
}

vec3 wavePos(vec3 coord)
{
   vec3 pos = wavePos1(coord)+wavePos2(coord)+wavePos3(coord)+coord;

   vFoam = 0.0;
#ifdef FOAM_NOISE
   vec2 c = (coord.xz+vec2(halfSeaWidth, halfSeaWidth))*invSeaWidth;
   vec4 tex = texture2D(foamAndNoiseSampler, c);
   pos.y += 8.5*tex.r;

   vFoam = tex.g+tex.b/256.;
#endif
//pos=coord;
   return pos;
}

vec3 waveNormal(vec3 wavePosition)
{
    vec3 t2 = normalize(wavePos(vec3(position.x+segmentLength, position.y, position.z)) - wavePosition);
    vec3 t1 = normalize(wavePos(vec3(position.x, position.y, position.z+segmentLength)) - wavePosition);

    return cross(t1, t2);
}



void main(void) {
  mat4 finalWorld;


#ifdef BONES
  mat4 m0 = mBones[int(matricesIndices.x)] * matricesWeights.x;
  mat4 m1 = mBones[int(matricesIndices.y)] * matricesWeights.y;
  mat4 m2 = mBones[int(matricesIndices.z)] * matricesWeights.z;

#ifdef BONES4
  mat4 m3 = mBones[int(matricesIndices.w)] * matricesWeights.w;
  finalWorld = world * (m0 + m1 + m2 + m3);
#else
  finalWorld = world * (m0 + m1 + m2);
#endif

#else
  finalWorld = world;
#endif


  vec3 wavePosition = wavePos(position);

#ifdef REFLECTION
  vPositionUVW = wavePosition;
#endif

  vec4 worldPos = finalWorld * vec4(wavePosition, 1.0);
  vPositionW = vec3(worldPos);
  gl_Position = viewProjection * worldPos;

  vNormalW = normalize(vec3(finalWorld * vec4(waveNormal(wavePosition), 0.0)));



  // Texture coordinates
#ifndef UV1
  vec2 uv = vec2(0., 0.);
#endif
#ifndef UV2
  vec2 uv2 = vec2(0., 0.);
#endif
#ifdef DIFFUSE
  if (vDiffuseInfos.x == 0.)
  {
    vDiffuseUV = vec2(diffuseMatrix * vec4(uv, 1.0, 0.0));
  }
  else
  {
    vDiffuseUV = vec2(diffuseMatrix * vec4(uv2, 1.0, 0.0));
  }
#endif

#ifdef AMBIENT
  if (vAmbientInfos.x == 0.)
  {
    vAmbientUV = vec2(ambientMatrix * vec4(uv, 1.0, 0.0));
  }
  else
  {
    vAmbientUV = vec2(ambientMatrix * vec4(uv2, 1.0, 0.0));
  }
#endif

#ifdef OPACITY
  if (vOpacityInfos.x == 0.)
  {
    vOpacityUV = vec2(opacityMatrix * vec4(uv, 1.0, 0.0));
  }
  else
  {
    vOpacityUV = vec2(opacityMatrix * vec4(uv2, 1.0, 0.0));
  }
#endif

#ifdef EMISSIVE
  if (vEmissiveInfos.x == 0.)
  {
    vEmissiveUV = vec2(emissiveMatrix * vec4(uv, 1.0, 0.0));
  }
  else
  {
    vEmissiveUV = vec2(emissiveMatrix * vec4(uv2, 1.0, 0.0));
  }
#endif

#ifdef SPECULAR
  if (vSpecularInfos.x == 0.)
  {
    vSpecularUV = vec2(specularMatrix * vec4(uv, 1.0, 0.0));
  }
  else
  {
    vSpecularUV = vec2(specularMatrix * vec4(uv2, 1.0, 0.0));
  }
#endif

#ifdef BUMP
  if (vBumpInfos.x == 0.)
  {
    vBumpUV = vec2(bumpMatrix * vec4(uv, 1.0, 1.0))/windWaveFactorLength;
  }
  else
  {
    vBumpUV = vec2(bumpMatrix * vec4(uv2, 1.0, 1.0))/windWaveFactorLength;
  }
#endif

#ifdef FOAM_TEXTURE
  if (vFoamInfos.x == 0.)
  {
    vFoamUV = vec2(foamMatrix * vec4(uv, 1.0, 0.0)*50.);
  }
  else
  {
    vFoamUV = vec2(foamMatrix * vec4(uv2, 1.0, 0.0)*50.);
  }
#endif

  // Clip plane
#ifdef CLIPPLANE
  fClipDistance = dot(worldPos, vClipPlane);
#endif

  // Fog
#ifdef FOG
  fFogDistance = (view * worldPos).z;
#endif

  // Shadows
#ifdef SHADOWS
#ifdef LIGHT0
  vPositionFromLight0 = lightMatrix0 * vec4(position, 1.0);
#endif
#ifdef LIGHT1
  vPositionFromLight1 = lightMatrix1 * vec4(position, 1.0);
#endif
#ifdef LIGHT2
  vPositionFromLight2 = lightMatrix2 * vec4(position, 1.0);
#endif
#ifdef LIGHT3
  vPositionFromLight3 = lightMatrix3 * vec4(position, 1.0);
#endif
#endif

  // Vertex color
#ifdef VERTEXCOLOR
  vColor = color;
#endif
}
