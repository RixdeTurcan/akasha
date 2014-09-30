attribute vec2 uv;

uniform mat4 uViewProjection;

varying vec3 vVertexPos;

#ifdef HEIGHT
  uniform sampler2D uHeightSampler;
#endif

vec3 computeVertexPos(vec2 coord)
{
    return vec3(texture2D(uHeightSampler, coord).yxz);
}

void main(void)
{

  vec3 pos = computeVertexPos(uv);

  vVertexPos = pos;

  gl_Position = uViewProjection * vec4(pos, 1.);
}
