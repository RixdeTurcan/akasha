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


float uTreeUnitSize = 320.;
uniform vec3 uSunDir;
float uTreeLength = 250.;
float uInvTreeLength = 1./uTreeLength;

float uTreeNbHalfUnit = 60.;
float uTreeNbUnit = uTreeNbHalfUnit*2.+1.;

uniform sampler2D uTreeHeightSampler;
float uTreeHeightSamplerSize = 128.;

uniform sampler2D uTreeTextureSampler;
float uNbRows = 8.;
float uNbCols = 8.;
float uInvNbRows = 1./uNbRows;
float uInvNbCols = 1./uNbCols;

uniform float uTreeToTestX[NB_TREE_TEST_MAX];
uniform float uTreeToTestY[NB_TREE_TEST_MAX];
uniform float uTreeToTest[NB_TREE_TEST_MAX];


vec4 getTreePos(float i, float j)
{
  vec2 uv = vec2(floor(uTreeNbHalfUnit+i+1.),
                 floor(uTreeNbHalfUnit+j+1.))/uTreeHeightSamplerSize;

  return texture2D(uTreeHeightSampler, uv);
}


float test(float uTreeToTest, float uTreeToTestX, float uTreeToTestY, float shadow, vec3 e, vec3 w, vec2 n,
           vec2 t, float directionnalShadowFactor, float occlusionLength,
           vec3 wodn, vec2 pInit, float angleStep, float angle)
{
    if (uTreeToTest>0.5){

       vec4 p = getTreePos(uTreeToTestX+pInit.x, uTreeToTestY+pInit.y);

       vec3 pe = p.xyz-e.xyz;
       float distXZPe = length(pe.xz);

       vec3 diffuseFactors = computeDiffuseFactors(p.y);
       //p.y -= 10.;

       if (diffuseFactors.y>0.4)
       {
         if (dot(pe, w)>0.)
         {
           vec3 dx = wodn*dot(n, pe.xz);
           vec3 x = e+dx;

           float u = (dot(pe.xz, t)*uInvTreeLength)*0.5+0.5;
           float v = (x.y-p.y)*(uInvTreeLength*0.5);

           if (v>=0. && v<0.95 && u>=0. && u<0.95)
           {
             float angleI = angle + p.a;
             angleI = mod(angleI, 6.28);
             float id = angle/angleStep;
             float row = floor(mod(id, uNbRows));
             float col = floor(id*uInvNbRows);

             vec2 uv = (vec2(u, v)+vec2(row, col))*vec2(uInvNbRows, uInvNbCols);

             float l = smoothstep(uTreeUnitSize*4., uTreeUnitSize*2., length(dx.xz));

             float alpha = texture2D(uTreeTextureSampler, uv).a;
             shadow = min(shadow, 1.-0.3*alpha*alpha*directionnalShadowFactor*l);

           }
         }
         if (distXZPe<occlusionLength)
         {
           shadow = min(shadow, 1.-0.3*smoothstep(occlusionLength, occlusionLength*0.5, distXZPe));
         }
       }
    }
    return shadow;
}

float computeTreeShadow(vec3 pos)
{
  float shadow = 1.;

  vec3 e = pos;
  vec3 w = normalize(uSunDir);
  vec2 n = normalize(uSunDir.xz);
  vec2 t = vec2(-n.y, n.x);

  float costheta = uSunDir.y;
  float directionnalShadowFactor = 0.5+0.5*smoothstep(1., 0.8, costheta);
  float ambiantShadowFactor = smoothstep(0.5, 1., costheta);
  float occlusionLength = mix(uTreeLength/3., uTreeLength/2.1, ambiantShadowFactor);

  vec3 wodn = w/dot(n, w.xz);
  vec2 pInit = (e.xz+mod(uPlayerPos.xz, uTreeUnitSize))/uTreeUnitSize+0.5;

  float angleStep = 6.28/(uNbRows*uNbCols);
  float angle = atan2(t.y, t.x);


  shadow = test(uTreeToTest[0], uTreeToTestX[0], uTreeToTestY[0], shadow, e, w, n,
                t, directionnalShadowFactor, occlusionLength,
                wodn, pInit, angleStep, angle);
  shadow = test(uTreeToTest[1], uTreeToTestX[1], uTreeToTestY[1], shadow, e, w, n,
                t, directionnalShadowFactor, occlusionLength,
                wodn, pInit, angleStep, angle);
  shadow = test(uTreeToTest[2], uTreeToTestX[2], uTreeToTestY[2], shadow, e, w, n,
                t, directionnalShadowFactor, occlusionLength,
                wodn, pInit, angleStep, angle);
  shadow = test(uTreeToTest[3], uTreeToTestX[3], uTreeToTestY[3], shadow, e, w, n,
                t, directionnalShadowFactor, occlusionLength,
                wodn, pInit, angleStep, angle);
  shadow = test(uTreeToTest[4], uTreeToTestX[4], uTreeToTestY[4], shadow, e, w, n,
                t, directionnalShadowFactor, occlusionLength,
                wodn, pInit, angleStep, angle);
  shadow = test(uTreeToTest[5], uTreeToTestX[5], uTreeToTestY[5], shadow, e, w, n,
                t, directionnalShadowFactor, occlusionLength,
                wodn, pInit, angleStep, angle);
  shadow = test(uTreeToTest[6], uTreeToTestX[6], uTreeToTestY[6], shadow, e, w, n,
                t, directionnalShadowFactor, occlusionLength,
                wodn, pInit, angleStep, angle);
  shadow = test(uTreeToTest[7], uTreeToTestX[7], uTreeToTestY[7], shadow, e, w, n,
                t, directionnalShadowFactor, occlusionLength,
                wodn, pInit, angleStep, angle);
  shadow = test(uTreeToTest[8], uTreeToTestX[8], uTreeToTestY[8], shadow, e, w, n,
                t, directionnalShadowFactor, occlusionLength,
                wodn, pInit, angleStep, angle);
  shadow = test(uTreeToTest[9], uTreeToTestX[9], uTreeToTestY[9], shadow, e, w, n,
                t, directionnalShadowFactor, occlusionLength,
                wodn, pInit, angleStep, angle);

  return shadow;
}

varying float vShadow;
varying vec3 vFlatPosInWorld;

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

  vFlatPosInWorld = pos;

  //Spherify the world
  float uEarthRadius = 200000.;
  float dist = length(pos.xz);
  float height = uEarthRadius + pos.y;
  pos.y = height/sqrt(1.+dist*dist/(height*height)) - uEarthRadius;


  //Fill some varying
  #ifdef GRASS
    vDeltaPos = deltaPos;
  #endif
  vNormal = normalize(normal);
  vVertexPosInWorld = pos;

  vShadow = computeTreeShadow(pos);

  vDiffuseHeightOffset = groundTex.a;


  //Compute the screen position
  gl_Position = uViewProjection * vec4(pos, 1.);
}
