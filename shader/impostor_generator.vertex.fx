attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

vec3 uBoxLimits = vec3(3.8, 3.8, 5.);
vec3 uInvBoxLimits = 1./uBoxLimits;

#ifdef DIFFUSE
  uniform mat4 uDiffuseMatrix;
  varying vec2 vDiffuseUV;
#endif

#ifndef RENDER_COLOR
  #ifdef BUMP
    uniform mat4 uBumpMatrix;
    varying vec2 vBumpUV;
    varying vec3 vNormal;
    varying vec3 vTangent;
    varying vec3 vBitangent;
  #endif
#endif

void main(void)
{

  #ifdef DIFFUSE
    vDiffuseUV = vec2(uDiffuseMatrix * vec4(uv, 1.0, 0.0));
  #endif

  #ifndef RENDER_COLOR
    #ifdef BUMP
      vBumpUV = vec2(uBumpMatrix * vec4(uv, 1.0, 0.0));
      vNormal = normal;
      vec3 t1 = cross(vNormal, vec3(0., 0., 1.));
      vec3 t2 = cross(vNormal, vec3(0., 1., 0.));
      if (length(t1) > length(t2))
      {
        vTangent = t1;
      }
      else
      {
        vTangent = t2;
      }
      vBitangent = cross(vNormal, vTangent);
    #endif
  #endif

  gl_Position = vec4(position*uInvBoxLimits, 1.);
}
