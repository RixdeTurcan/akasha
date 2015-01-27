attribute vec3 position;
attribute vec2 uv2;
attribute vec2 uv;

uniform mat4 uViewProjection;
uniform vec3 uPlayerPos;
uniform vec3 uEyePosInWorld;

varying vec2 vUv;

#ifdef BUMP
  varying vec3 vNormal;
  varying vec3 vBitangent;
  varying vec3 vTangent;
#endif


varying vec3 vVertexPosInWorld;

void main(void)
{
  //Real distance between samples
  float DeltaFloor = uv2.x;

  //smoothed distance between samples
  float deltaPos = uv2.y;
  vec2 deltaPosVec = vec2(1., 1.)*DeltaFloor;


  //Floor the grid to have constant vextex position
  vec3 deltaPlayerPos = mod(uPlayerPos, DeltaFloor);

  vec2 vertexPos = position.xz-deltaPlayerPos.xz;

  //Randomise the position of the sprite
  float deltaX = computeOctaves(vec3(0.4, 0.3, 0.3), vec2(0.001, 0.001),
                                vertexPos+uPlayerPos.xz, vec2(0., 0.), 1.);
  float deltaY = computeOctaves(vec3(0.4, 0.3, 0.3), vec2(0.001, 0.001),
                                vertexPos+uPlayerPos.xz+1985., vec2(0., 0.), 1.);

  vertexPos.x += 200.*deltaX;
  vertexPos.y += 200.*deltaY;

  //Compute the height of the vertex
  vec3 pos = computeVertexPos(vertexPos, vec2(0., 0.), uPlayerPos.xz);


  vec3 diffuseFactors = computeDiffuseFactors(pos.y);

  if (diffuseFactors.y>0.2)
  {

    //Compute the tbn vectors
    vec3 tangent = normalize(vec3(-pos.z, 0., pos.x));
    vec3 bitangent = vec3(0., 1., 0.);
    vec3 normal = cross(tangent, bitangent);

    pos.xz += tangent.xz*(uv.x-0.5)*500.;
    pos.y += uv.y*500. - 5.;

    //Fill some varying
    vUv = uv;
    #ifdef BUMP
      vNormal = normal;
      vBitangent = bitangent;
      vTangent = tangent;
    #endif
    vVertexPosInWorld = pos;
    //Compute the screen position
    gl_Position = uViewProjection * vec4(pos, 1.);

  }
  else
  {
    vUv = uv;
    #ifdef BUMP
      vNormal = vec3(0., 1., 0.);
      vBitangent = vec3(0., 0., 1.);
      vTangent = vec3(1., 0., 0.);
    #endif
    vVertexPosInWorld = pos;
    gl_Position = vec4(-2., -2., -2., 1.);
  }
}
