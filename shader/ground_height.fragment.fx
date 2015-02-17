
uniform vec3 uPlayerPos;

void main(void)
{
  mat3 groundFactors = computeGroundFactor(gl_FragCoord.xy);

  //Stop here if we are not in thee view frustrum (lod, minRadius, maxRadius, frustrum triangle)
  if ( groundFactors[2].x>=uNbLod || groundFactors[0].x<groundFactors[0].y
    || groundFactors[0].x>groundFactors[0].z || !isInFrustrum(groundFactors[1].yz))
  {
    discard;return;
  }

  vec3 vertexPosAndSmoothSampling = computeVertexPosAndSmoothSampling(groundFactors, uPlayerPos);
  float smoothUnitSize = vertexPosAndSmoothSampling.z;
  vec2 pos = vertexPosAndSmoothSampling.xy;

  //Compute the height of the pixel
  vec2 deltaPosVec = vec2(1., 1.)*smoothUnitSize;
  vec3 pos0 = computeVertexPos(pos, deltaPosVec, uPlayerPos.xz);

  //Compute the normal of the vertex
  vec3 posX = computeVertexPos(pos+vec2(smoothUnitSize, 0.), deltaPosVec, uPlayerPos.xz);
  vec3 posY = computeVertexPos(pos+vec2(0., smoothUnitSize), deltaPosVec, uPlayerPos.xz);
  vec3 normal = normalize(cross(pos0-posX, posY-pos0));

  //Compute the diffuse height offset
  float diffuseHeightOffset = getDiffuseHeightOffset(pos+uPlayerPos.xz, deltaPosVec);

  gl_FragColor = vec4(pos0.y, normal.xz, diffuseHeightOffset);
}
