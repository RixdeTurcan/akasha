attribute vec2 uv;

uniform mat4 uViewProjection;

uniform vec3 uDeltaPos;

varying float vDepth;

#ifdef HEIGHT
  uniform sampler2D uHeightSampler;
#endif

vec3 computeVertexPos(vec2 coord)
{
    return vec3(texture2D(uHeightSampler, coord).yxz);
}

void main(void)
{

  vec4 worldPos = uViewProjection * vec4(computeVertexPos(uv)+uDeltaPos, 1.);

  float sx = step(0., worldPos.x)*2.-1.;
  float sy = step(0., worldPos.y)*2.-1.;

  worldPos.x = sqrt(abs(worldPos.x))*sx;
  worldPos.y = sqrt(abs(worldPos.y))*sy;

  vDepth = worldPos.z/worldPos.w;

  gl_Position = worldPos;
}
