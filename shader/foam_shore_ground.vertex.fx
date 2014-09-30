attribute vec2 uv;

uniform mat4 uViewProjection;
uniform vec3 uEyePosInWorld;

uniform float uTangentScreenDist;
uniform float uMaxHeight;
uniform vec3 uDeltaFoamCenterPos;
uniform float uFoamWidth;

varying float vHeight;
varying vec3 vNormal;

uniform sampler2D uHeightSampler;

vec3 computeVertexPos(vec2 coord)
{
    return vec3(texture2D(uHeightSampler, coord).yxz);
}

void main(void)
{

  vec3 pos = computeVertexPos(uv);

  vec2 uvX = vec2(uv.x+uTangentScreenDist, uv.y);
  vec3 posX = computeVertexPos(uvX);

  vec2 uvY = vec2(uv.x, uv.y+uTangentScreenDist);
  vec3 posY = computeVertexPos(uvY);

  vec3 normal = normalize(cross(pos-posX, posY-pos));

  vHeight = pos.y/uMaxHeight;
  vNormal = normal;

  vec2 uv = (pos.xz+uDeltaFoamCenterPos.xz)/uFoamWidth;

  gl_Position = vec4(uv, 0., 1.);
}
