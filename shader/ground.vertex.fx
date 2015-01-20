attribute vec3 position;
attribute vec2 uv2;

uniform mat4 uViewProjection;
uniform vec3 uPlayerPos;

varying vec3 vNormal;
varying vec3 vVertexPosInWorld;
varying float vDiffuseHeightOffset;

void main(void)
{
  //Real distance between samples
  float DeltaFloor = uv2.x;

  //smoothed distance between samples
  float deltaPos = uv2.y;
  vec2 deltaPosVec = vec2(1., 1.)*deltaPos;


  //Floor the grid toz have constant vextex position
  vec3 deltaPlayerPos = mod(uPlayerPos, DeltaFloor);
  vec2 vertexPos = position.xz-deltaPlayerPos.xz;

  //Compute the height of the vertex
  vec3 pos = computeVertexPos(vertexPos, deltaPosVec, uPlayerPos.xz);

  //Compute the normal of the vertex
  vec3 posX = computeVertexPos(vertexPos+vec2(deltaPos, 0.), deltaPosVec, uPlayerPos.xz);
  vec3 posY = computeVertexPos(vertexPos+vec2(0., deltaPos), deltaPosVec, uPlayerPos.xz);
  vec3 normal = normalize(cross(pos-posX, posY-pos));

  //Fill some varying
  vNormal = normalize(normal);
  vVertexPosInWorld = pos;
  vDiffuseHeightOffset = getDiffuseHeightOffset(pos.xz+uPlayerPos.xz, deltaPosVec);

  //Compute the screen position
  gl_Position = uViewProjection * vec4(pos, 1.);
}
