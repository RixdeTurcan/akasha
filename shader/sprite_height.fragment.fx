
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

  vec2 worldPos = pos+uPlayerPos.xz;

  pos.x += 0.*60.*fastRand(0.0001*worldPos);
  pos.y += 0.*60.*fastRand(0.0001*(worldPos+1985.));

  //Compute the height of the sprite
  vec3 pos0 = computeVertexPos(pos, vec2(0., 0.), uPlayerPos.xz);

  //Compute the angle rand
  float angle = 3.14*fastRand(0.001*(worldPos+1435.));

  gl_FragColor = vec4(pos0, angle);
}
