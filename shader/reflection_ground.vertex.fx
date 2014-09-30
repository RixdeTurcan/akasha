attribute vec2 uv;

uniform mat4 uViewProjection;

uniform float uTangentScreenDist;

varying vec3 vNormal;
varying vec3 vVertexPosInWorld;
varying vec2 vUv;
varying float vDiffuseHeightOffset;

#ifdef HEIGHT
  uniform sampler2D uHeightSampler;
#endif

#ifdef CLIPPLANE
  uniform vec4 uClipPlane;
  varying float vClipDistance;
#endif

#ifdef WAVE
  uniform sampler2D uWaveDataSampler;
  uniform float uWaveMaxHeight;
#endif

vec3 computeVertexPos(vec2 coord)
{
  return vec3(texture2D(uHeightSampler, coord).yxz);
}

void main(void)
{

  vec3 pos = computeVertexPos(uv);
  vVertexPosInWorld = pos;

  vec2 uvX = vec2(uv.x+uTangentScreenDist, uv.y);
  vec3 posX = computeVertexPos(uvX);

  vec2 uvY = vec2(uv.x, uv.y+uTangentScreenDist);
  vec3 posY = computeVertexPos(uvY);

  vec3 normal = normalize(cross(pos-posX, posY-pos));

  vec4 waveData = texture2D(uWaveDataSampler, uv);
  float shift = waveData.r * uWaveMaxHeight;
  float epsilon = 0.02 * uWaveMaxHeight;
  pos.y -= 2.*shift + epsilon;

  vNormal = normalize(normal);
  vUv = uv;
  vDiffuseHeightOffset = texture2D(uHeightSampler, uv).a;


  #ifdef CLIPPLANE
    vClipDistance = dot(vec4(pos, 1.), uClipPlane+vec4(0., 0., 0., -shift-epsilon));
  #endif

  gl_Position = uViewProjection * vec4(pos, 1.);
}
