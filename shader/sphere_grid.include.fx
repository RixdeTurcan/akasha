#ifndef PI
  #define PI 3.14159265359
#endif

vec3 computeEyeToPosDir(vec2 uv)
{

    vec3 eyeToPosDir = vec3(0., 0., 0.);

    eyeToPosDir.y = uv.y*2.-1.;

    float beta = uv.x*2.*PI;
    float alpha = sqrt(1.-eyeToPosDir.y*eyeToPosDir.y);

    eyeToPosDir.x = alpha*cos(beta);
    eyeToPosDir.z = alpha*sin(beta);

    return eyeToPosDir;
}

vec2 computeUv(vec3 eyeToPosDir)
{
      vec2 uv = vec2(0., 0.);

      uv.x = atan(eyeToPosDir.z, eyeToPosDir.x)/(2.*PI);
      uv.y = (eyeToPosDir.y*0.5+0.5);

      return 1.-uv;
}

vec2 computeUv(vec3 eyeToPosDir, float verticalShift)
{
      vec2 uv = vec2(0., 0.);

      uv.x = atan(eyeToPosDir.z, eyeToPosDir.x)/(2.*PI);
      uv.y = (eyeToPosDir.y*0.5+0.5) + verticalShift;

      return 1.-uv;
}
