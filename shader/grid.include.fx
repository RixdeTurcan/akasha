vec3 projectOnYPlane(vec3 pos, vec3 eyePos, float meanHeight)
{
   vec3 eyeToPosDir = pos-eyePos;

   float alpha = (meanHeight-eyePos.y)/eyeToPosDir.y;

   vec3 projectedPos = vec3(eyePos.x, meanHeight, eyePos.z);
   projectedPos.xz += alpha*eyeToPosDir.xz;

   return projectedPos;
}

vec3 computePos(vec2 uv, vec3 minPosLeft, vec3 minPosRight, vec3 maxPosLeft, vec3 maxPosRight)
{
    vec3 minPos = uv.x*minPosLeft + (1.-uv.x)*minPosRight;
    vec3 maxPos = uv.x*maxPosLeft + (1.-uv.x)*maxPosRight;
    return uv.y*minPos + (1.-uv.y)*maxPos;
}

vec3 computeProjectedPos(vec2 uv,
                         vec3 minPosLeft, vec3 minPosRight, vec3 maxPosLeft, vec3 MaxPosRight,
                         vec3 eyePos, float meanHeight)
{

    return projectOnYPlane(computePos(uv, minPosLeft, minPosRight, maxPosLeft, MaxPosRight),
                           eyePos, meanHeight);
}

#define PROJ_AXES xz
#define AXIS_1 x
#define AXIS_2 z

float crossVec2(vec2 a, vec2 b)
{
  return a.x*b.y - a.y*b.x;
}

vec2 computeUv(vec3 pos, vec3 A, vec3 B, vec3 C, vec3 D)
{
  vec3 H = D - pos;
  vec3 E = B - D;
  vec3 F = C - D;
  vec3 G = A - C + D - B;


  float a = crossVec2(E.PROJ_AXES, G.PROJ_AXES);
  float b = crossVec2(H.PROJ_AXES, G.PROJ_AXES) + crossVec2(E.PROJ_AXES, F.PROJ_AXES);
  float c = crossVec2(H.PROJ_AXES, F.PROJ_AXES);

  float d = b*b-4.*a*c;

  float u = 0.;
  float v = 0.;

  if (abs(a)<0.001)
  {
    v = -c/b;
  }
  else
  {
    v = (-b-sqrt(d))/(2.*a);
    if (v<0. || v>=1.)
    {
      v = (-b+sqrt(d))/(2.*a);
    }
  }

  #ifdef USE_SECOND_AXIS
    u = (-H.AXIS_2 -  E.AXIS_2 * v) / (F.AXIS_2 +  G.AXIS_2 * v);
  #else
    u = (-H.AXIS_1 -  E.AXIS_1 * v) / (F.AXIS_1 +  G.AXIS_1 * v);
  #endif


  return vec2(u, v);
}


/*

vec2 computeUv(vec3 pos, vec3 A, vec3 B, vec3 C, vec3 D)
{
  vec3 H = pos - D;
  vec3 E = B - D;
  vec3 F = C - D;
  vec3 G = A - C + D - B;


  float a = crossVec2(G.PROJ_AXES, F.PROJ_AXES);
  float b = crossVec2(E.PROJ_AXES, F.PROJ_AXES) + crossVec2(H.PROJ_AXES, G.PROJ_AXES);
  float c = crossVec2(H.PROJ_AXES, E.PROJ_AXES);

  float d = b*b-4.*a*c;

  float u = 0.;
  float v = 0.;

  if (abs(a)<0.001)
  {
    v = -c/b;
  }
  else
  {
    v = (-b-sqrt(d))/(2.*a);
    if (v<0. || v>=1. || u<0. || u>=1.)
    {
      v = (-b+sqrt(d))/(2.*a);

    }
  }
  u = (H.U_AXIS -  F.U_AXIS * v) / (E.U_AXIS +  G.U_AXIS * v);

  return vec2(u, v);
}



uniform vec3 uMinPosLeft;
uniform vec3 uMinPosRight;
uniform vec3 uMaxPosLeft;
uniform vec3 uMaxPosRight;

uniform mat4 uWorldToScreen;

vec4 uMinPosLeftInScreen = uWorldToScreen * vec4(uMinPosLeft, 1.);
vec4 uMinPosRightInScreen = uWorldToScreen * vec4(uMinPosRight, 1.);
vec4 uMaxPosLeftInScreen = uWorldToScreen * vec4(uMaxPosLeft, 1.);
vec4 uMaxPosRightInScreen = uWorldToScreen * vec4(uMaxPosRight, 1.);

uniform vec3 uEyePosInWorld;

vec3 projOnScreenPlane(vec3 pos, vec3 eyePosInWorld,
                       vec3 minPosLeft, vec3 minPosRight, vec3 maxPosLeft)
{
    vec3 m = normalize(eyePosInWorld-pos);
    vec3 x = maxPosLeft-minPosLeft;
    vec3 y = minPosRight-minPosLeft;
    vec3 n = normalize(cross(x, y));
    float a = dot(minPosLeft-pos, n)/dot(m, n);
    return pos + a*m;
}


  vec3 posWorld = vec3(pos.x, 0., pos.y);

  vec3 projPos = projOnScreenPlane(posWorld);

  vec4 projPosInScreen = uWorldToScreen * vec4(projPos, 1.);

  vec2 uv = computeUv(projPosInScreen.xyz,
                      uMinPosLeftInScreen.xyz, uMaxPosLeftInScreen.xyz,
                      uMinPosRightInScreen.xyz, uMaxPosRightInScreen.xyz);

*/
