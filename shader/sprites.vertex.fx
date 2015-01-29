attribute vec3 position;
attribute vec2 uv2;
attribute vec2 uv;

uniform mat4 uViewProjection;
uniform vec3 uPlayerPos;
uniform vec3 uEyePosInWorld;

#ifdef BUMP
  varying vec3 vNormal;
  varying vec3 vBitangent;
  varying vec3 vTangent;
#endif

uniform float uNbRows;
uniform float uNbCols;


varying float vAngleFactor;
varying vec2 vUv1;
varying vec2 vUv2;

varying vec3 vVertexPosInWorld;



void main(void)
{
  //Floor the grid to have constant vextex position
  vec2 vertexPos = position.xz-mod(uPlayerPos.xz, uv2.x);
  vec2 worldPos = vertexPos+uPlayerPos.xz;

  //Randomise the position of the sprite
  vertexPos.x += 60.*fastRand(0.0001*worldPos);
  vertexPos.y += 60.*fastRand(0.0001*(worldPos+1985.));

  //Compute the height of the vertex
  vec3 pos = computeVertexPos(vertexPos, vec2(0., 0.), uPlayerPos.xz);

  //Get diffuse factors
  vec3 diffuseFactors = computeDiffuseFactors(pos.y);

  if (diffuseFactors.y>0.4)
  {

    //Compute the tbn vectors
    vec3 tangent = normalize(vec3(pos.z, 0., -pos.x));
    vec3 bitangent = vec3(0., 1., 0.);
    vec3 normal = vec3(-tangent.z, 0., tangent.x);

    //Position of the sprite corners
    pos.xz += tangent.xz*(uv.x-0.5)*500.;
    pos.y += uv.y*500. - 30.;

    //Compute the orientation
    float angle = 3.14*fastRand(0.0001*(worldPos+1435.));
    angle -= atan2(tangent.z, tangent.x);
    angle = mod(angle, 6.28);


    float id = uNbRows*uNbCols*angle/6.28;
    float row1 = mod(id, uNbRows);
    float col1 = floor(id/uNbRows);
    float row2 = mod(id+1., uNbRows);
    float col2 = mod(floor((id+1.)/uNbRows), uNbCols);


    //Modify the tangent and normal relative to the angle
    float cosA = cos(angle);
    float sinA = sin(angle);
    vec3 modifiedTangent = vec3(tangent.x*cosA-tangent.z*sinA,
                                0.,
                                tangent.x*sinA+tangent.z*cosA);
    vec3 modifiedNormal = vec3(-modifiedTangent.z, 0., modifiedTangent.x);


    //Fill some varying
    vAngleFactor = fract(row1);
    vUv1 = (uv+vec2(floor(row1), col1))/uNbRows;
    vUv2 = (uv+vec2(floor(row2), col2))/uNbCols;
    #ifdef BUMP
      vNormal = modifiedNormal;
      vBitangent = bitangent;
      vTangent = modifiedTangent;
    #endif
    vVertexPosInWorld = pos;
    //Compute the screen position
    gl_Position = uViewProjection * vec4(pos, 1.);
  }
  else
  {
    vUv1 = uv;
    vUv2 = uv;
    vAngleFactor = 0.;

    #ifdef BUMP
      vNormal = vec3(0., 1., 0.);
      vBitangent = vec3(0., 0., 1.);
      vTangent = vec3(1., 0., 0.);
    #endif
    vVertexPosInWorld = pos;
    gl_Position = vec4(-2., -2., -2., 1.);
  }
}
