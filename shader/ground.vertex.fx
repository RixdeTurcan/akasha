attribute vec3 position;
attribute vec3 color;

uniform mat4 uViewProjection;
uniform vec3 uPlayerPos;
uniform vec3 uEyePosInWorld;

varying vec3 vNormal;
varying vec3 vVertexPosInWorld;
varying float vDiffuseHeightOffset;

#ifdef GRASS
  varying float vDeltaPos;
#endif

#ifdef GROUND_HEIGHT
  uniform sampler2D uGroundHeightSampler;
#endif

void main(void)
{
  vec4 groundTex = texture2D(uGroundHeightSampler, color.xy);

  //Floor the grid to have constant vertex position
  vec3 deltaPlayerPos = mod(uPlayerPos, color.z);
  vec2 vertexPos = position.xz-deltaPlayerPos.xz;

  vec3 pos = vec3(vertexPos.x,
                  groundTex.x,
                  vertexPos.y);
  vec3 normal = vec3(groundTex.y,
                     sqrt(1.-groundTex.y*groundTex.y-groundTex.z*groundTex.z),
                     groundTex.z);


  //Fill some varying
  #ifdef GRASS
    vDeltaPos = deltaPos;
  #endif
  vNormal = normalize(normal);
  vVertexPosInWorld = pos;

  vDiffuseHeightOffset = groundTex.a;

  //Compute the screen position
  gl_Position = uViewProjection * vec4(pos, 1.);
}
