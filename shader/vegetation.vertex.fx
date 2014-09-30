#ifndef PI
  #define PI 3.14159265359
#endif

attribute vec2 uv;
attribute vec2 uv2;

uniform mat4 uViewProjection;

uniform sampler2D uPosSampler;

uniform vec3 uDeltaPos;
uniform vec3 uPlayerPos;
uniform vec3 uEyePosInWorld;

uniform float uSize;
uniform float uUMin;
uniform float uLod;
uniform float uUMorphing;

uniform float uTime;

varying vec2 vUv;
varying float vAlpha;
varying float vDepth;
varying float vDiffuseFactor;
varying vec3 vVertexPosInWorld;
varying vec3 vNormal;

void main(void)
{
  float lod = uLod;

  if (abs(uv2.x)<uUMin && abs(uv2.y)<uUMin)
  {
    gl_Position = vec4(2., 2., 2., 1.);
    return;
  }

  vec2 posXZ = uv2*uSize;

  vec3 pos = vec3(posXZ.x, 0., posXZ.y) + uDeltaPos;

  vec2 uvPos =uv2*0.5+0.5;

  vec4 posTex = texture2D(uPosSampler, uvPos);
  pos.y = posTex.r;


  float diffuseGroundHeightOffset = posTex.b;
  float heightLimit = 90. + diffuseGroundHeightOffset;
  float heightThreshold = 60.;
  vDiffuseFactor = smoothstep(heightLimit-heightThreshold, heightLimit+heightThreshold, pos.y);
  vDiffuseFactor *= posTex.a;

  if (pos.y<=0.)
  {
    gl_Position = vec4(2., 2., 2., 1.);
    return;
  }



  vec2 uvPos1 =uv2*0.5+0.5+vec2(1./32., 0.);
  vec4 posTex1 = texture2D(uPosSampler, uvPos1);
  vec2 uvPos2 =uv2*0.5+0.5+vec2(0., 1./32.);
  vec4 posTex2 = texture2D(uPosSampler, uvPos2);

  vec2 pos1XZ = (uv2+vec2(1./16., 0.))*uSize;
  vec3 pos1 = vec3(pos1XZ.x, posTex1.r, pos1XZ.y) + uDeltaPos;

  vec2 pos2XZ = (uv2+vec2(0., 1./16.))*uSize;
  vec3 pos2 = vec3(pos2XZ.x, posTex2.r, pos2XZ.y) + uDeltaPos;

  vNormal = normalize(cross(pos-pos1, pos2-pos));




  vec2 uvP = uv+0.5;

  pos.y += (0.5-uv.y-0.2-1.) * 20. * (1.+exp2(lod));

  vec2 eyePosToVertexDir = normalize(pos.xz - uEyePosInWorld.xz);

  pos.z += sin(posTex.g) * uv.x * 40. * (1.+exp2(lod));
  pos.x += cos(posTex.g) * uv.x * 40. * (1.+exp2(lod));

  float angleX = cos(uTime*1.+(pos.x+uPlayerPos.x)/200.) * (0.5-uv.y) * 0.5;
  pos.x += 20. * (1.+exp2(lod)) * sin(angleX);
  pos.y += 20. * (1.+exp2(lod)) * cos(angleX);


  vUv = vec2(1.-min(floor(uLod), 3.)/4.-uvP.x/4., uvP.y/8.);
  vVertexPosInWorld = pos;



  vAlpha = min(max(smoothstep(uUMin, uUMin+uUMorphing, abs(uv2.x)),
               smoothstep(uUMin, uUMin+uUMorphing, abs(uv2.y))),
               min(1.-smoothstep(1.-uUMorphing, 1., abs(uv2.x)),
               1.-smoothstep(1.-uUMorphing, 1., abs(uv2.y))));

  vDepth = length(pos - uEyePosInWorld);

  gl_Position = uViewProjection * vec4(pos, 1.);
}
