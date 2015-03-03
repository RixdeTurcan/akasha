attribute vec3 position;
attribute vec3 color;
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
varying vec2 vCoord1;
varying vec2 vCoord2;

varying vec3 vVertexPosInWorld;

#ifdef GROUND_HEIGHT
  uniform sampler2D uGroundHeightSampler;
#endif

void main(void)
{
  vec4 groundTex = texture2D(uGroundHeightSampler, color.xy);

  vec3 pos = groundTex.xyz;

  //Get diffuse factors
  vec3 diffuseFactors = computeDiffuseFactors(pos.y);

  if (diffuseFactors.y>0.4)
  {
    vec2 worldPos = pos.xz+uPlayerPos.xz;
    float eyeToVertexDist = length(uEyePosInWorld.xz-pos.xz);

    //Compute the tbn vectors
    vec3 normal = normalize(vec3(pos.x, 0., pos.z));
    vec3 tangent = vec3(-normal.z, 0., normal.x);
    vec3 bitangent = vec3(0., 1., 0.);

    //Position of the sprite corners
    pos.xz += tangent.xz*(uv.x-0.5)*500.;
    pos.y += uv.y*500.;// - 10.;

    //Compute the orientation
    float angle = groundTex.a;
    angle += atan2(tangent.z, tangent.x);
    angle = mod(angle, 6.28);

    float angleStep = 6.28/(uNbRows*uNbCols);
    float id = angle/angleStep;
    float row1 = mod(id, uNbRows);
    float col1 = floor(id/uNbRows);
    float row2 = mod(id+1., uNbRows);
    float col2 = mod(floor((id+1.)/uNbRows), uNbCols);
    float angleFactor = fract(row1);
    row1 = floor(row1);
    row2 = floor(row2);

    angleFactor = mix(angleFactor, floor(angleFactor+0.5), smoothstep(3500., 4000., eyeToVertexDist));

    //Fill some varyingq
    vAngleFactor = angleFactor ;
    vUv1 = vec2(((uv.x*2.-1.)/cos(angleFactor*angleStep))*0.5+0.5, uv.y);
    vUv2 = vec2(((uv.x*2.-1.)/cos((1.-angleFactor)*angleStep))*0.5+0.5, uv.y);
    vCoord1 = vec2(row1, col1);
    vCoord2 = vec2(row2, col2);
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
    vUv1 = uv;
    vUv2 = uv;
    vCoord1 = vec2(0., 0.);
    vCoord2 = vec2(0., 0.);
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
