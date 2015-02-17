uniform float uBeta;
uniform float uCosBeta;
uniform float uSinBeta;

uniform float uTransitionSizeBot;// = 1.;
uniform float uTransitionSizeTop;// = 2.;

uniform float uUnitSize;// = 20.;
uniform float uNbHalfUnit;// = 125.+uTransitionSizeBot+1.;
uniform float uNbUnit;// = uNbHalfUnit*2.+1.;
uniform float uFinalNbHalfUnit;// = 125.;

uniform float uNbLod;// = 4.;

uniform float uBetaRange;// = 1.5*3.14/5.;
uniform float uBetaCenterDist;// = -950.;
uniform float uDistMin;// = 950.;

bool isInFrustrum(vec2 pos)
{
  vec2 centerPos = uBetaCenterDist*vec2(uCosBeta, uSinBeta);

  vec2 v = normalize(-centerPos);

  float cosAlpha = dot(normalize(pos-centerPos), v);
  float dist = length(pos-centerPos)*cosAlpha;

  return (cosAlpha>cos(uBetaRange) && dist>uDistMin);
}

mat3 computeGroundFactor(vec2 pixel)
{
    //Compute the Lod id
  float lod = floor(pixel.x/uNbUnit);

  //Get the unit id and the radius
  vec2 unit = pixel;
  unit.x -= lod*uNbUnit;
  float radius = max(abs(unit.x-uNbHalfUnit), abs(unit.y-uNbHalfUnit));

  //compute the radius min and max
  float radiusMin = 0.;
  if (lod>0.)
  {
    radiusMin = floor((uNbHalfUnit-uTransitionSizeBot-1.)/2.-uTransitionSizeTop);
  }
  float radiusMax = uNbHalfUnit;
  if (lod>=uNbLod-1.)
  {
    radiusMax = uFinalNbHalfUnit+1.;
  }

  //Compute the unit size
  float unitSize = uUnitSize * pow(2., lod);

  //Compute the pixel position
  vec2 pos = unit*unitSize-unitSize*uNbHalfUnit;

  return mat3(radius, radiusMin, radiusMax,
              unitSize, pos,
              lod, 0., 0.);
}

vec3 computeVertexPosAndSmoothSampling(mat3 groundFactors, vec3 playerPos)
{
  //Get the smoothed sampling
  float smoothFactor = min(1., (groundFactors[0].x-groundFactors[0].y)/(groundFactors[0].z-groundFactors[0].y));
  float smoothUnitSize = floor(groundFactors[1].x*1.5*(1.+1.*pow(smoothFactor, 2.)));

  //Floor the pixel position
  vec2 deltaPlayerPos = mod(playerPos.xz, groundFactors[1].x);
  vec2 pos = groundFactors[1].yz-deltaPlayerPos;

  return vec3(pos, smoothUnitSize);
}
