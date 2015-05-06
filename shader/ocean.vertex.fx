attribute vec3 position;
attribute vec3 color;

uniform mat4 uViewProjection;
uniform vec3 uPlayerPos;

varying vec3 vVertexPosInWorld;
varying float vGroundHeight;

#ifdef GROUND_HEIGHT
  uniform sampler2D uGroundHeightSampler;
#endif

void main(void)
{
  //Floor the grid to have constant vertex position
  vec3 deltaPlayerPos = mod(uPlayerPos, color.z);
  vec2 vertexPos = position.xz-deltaPlayerPos.xz;


  vec4 groundTex = texture2D(uGroundHeightSampler, color.xy);

  vec3 pos = vec3(vertexPos.x,
                  0.,
                  vertexPos.y);


  //Spherify the world
  float uEarthRadius = 200000.;
  float dist = length(pos.xz);
  float height = uEarthRadius + pos.y;
  pos.y = height/sqrt(1.+dist*dist/(height*height)) - uEarthRadius;

  //Compute the screen position
  gl_Position = uViewProjection * vec4(pos, 1.);

  //Fill some varying
  vVertexPosInWorld = pos;

  #ifdef GROUND_HEIGHT
    vGroundHeight = groundTex.x;
  #else
    vGroundHeight = 0.;
  #endif

}
